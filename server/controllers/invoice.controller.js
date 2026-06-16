const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Settings = require('../models/Settings');
const Business = require('../models/Business');
const generateInvoiceNumber = require('../utils/generateInvoiceNumber');
const { calculateGST } = require('../services/gst.service');
const { updateStock } = require('../services/stock.service');
const { generateInvoicePDF } = require('../services/pdf.service');

exports.getInvoices = async (req, res) => {
  const { page = 1, limit = 20, type, status, partyId, startDate, endDate } = req.query;
  const query = { businessId: req.user.businessId };
  if (type) query.type = type;
  if (status) query.status = status;
  if (partyId) query.party = partyId;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  const result = await Invoice.paginate(query, { page, limit, populate: { path: 'party', select: 'name phone' }, sort: { date: -1 } });
  res.json(result);
};

exports.createInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const settings = await Settings.findOne({ businessId: req.user.businessId });
    const { lineItems, date, placeOfSupply, type } = req.body;
    const { items, subtotal, totalDiscount, cgst, sgst, igst } = calculateGST(
      lineItems, settings?.businessState, placeOfSupply
    );
    const grandTotal = subtotal + cgst + sgst + igst + (req.body.roundOff || 0);
    const invoiceNumber = await generateInvoiceNumber(req.user.businessId, type, date);

    const [invoice] = await Invoice.create([{
      ...req.body, lineItems: items, subtotal, totalDiscount, cgst, sgst, igst,
      grandTotal, balanceDue: grandTotal - (req.body.amountPaid || 0),
      invoiceNumber, businessId: req.user.businessId, createdBy: req.user._id,
    }], { session });

    // update stock
    for (const item of items) {
      if (item.product) {
        const qty = type === 'sale' ? -item.qty : item.qty;
        const ledgerType = type === 'sale' ? 'sale' : 'purchase';
        await updateStock(item.product, qty, ledgerType, invoiceNumber, null, req.user.businessId, req.user._id, session);
      }
    }

    await session.commitTransaction();
    res.status(201).json(invoice);
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

exports.getInvoice = async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.user.businessId })
    .populate('party').populate('lineItems.product', 'name sku');
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  res.json(invoice);
};

exports.updateInvoice = async (req, res) => {
  const invoice = await Invoice.findOneAndUpdate(
    { _id: req.params.id, businessId: req.user.businessId }, req.body, { new: true }
  );
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  res.json(invoice);
};

exports.recordPayment = async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.user.businessId });
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

  invoice.amountPaid += req.body.amount;
  invoice.balanceDue = invoice.grandTotal - invoice.amountPaid;
  invoice.status = invoice.balanceDue <= 0 ? 'paid' : 'partial';
  if (req.body.paymentMode) invoice.paymentMode = req.body.paymentMode;
  if (req.body.paymentRef) invoice.paymentRef = req.body.paymentRef;
  await invoice.save();
  res.json(invoice);
};

exports.getInvoicePDF = async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.user.businessId })
    .populate('party', 'name phone gstin address');
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

  const business = await Business.findById(req.user.businessId);
  const pdfBuffer = await generateInvoicePDF(invoice.toObject(), business?.toObject());

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="${invoice.invoiceNumber}.pdf"`,
    'Content-Length': pdfBuffer.length,
  });
  res.send(pdfBuffer);
};
