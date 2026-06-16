const PDFDocument = require('pdfkit');
const { formatINR, amountInWords } = require('../utils/indianFormat');

const generateInvoicePDF = (invoice, business) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const buffers = [];
    doc.on('data', (b) => buffers.push(b));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const W = 515; // usable width
    const PRI = '#1A56DB';

    // Header
    doc.fontSize(20).fillColor(PRI).font('Helvetica-Bold').text(business?.name || 'ESP', 40, 40);
    doc.fontSize(9).fillColor('#475569').font('Helvetica').text(business?.address || '', 40, 65);
    doc.text(`GSTIN: ${business?.gstin || '—'}  |  ${business?.phone || ''}`, 40, 78);

    // Invoice title
    doc.fontSize(16).fillColor(PRI).font('Helvetica-Bold')
      .text(invoice.type === 'sale' ? 'TAX INVOICE' : 'PURCHASE BILL', 350, 40, { width: 200, align: 'right' });
    doc.fontSize(9).fillColor('#475569').font('Helvetica')
      .text(`Invoice No: ${invoice.invoiceNumber}`, 350, 62, { width: 200, align: 'right' })
      .text(`Date: ${new Date(invoice.date).toLocaleDateString('en-IN')}`, 350, 74, { width: 200, align: 'right' })
      .text(`Due: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : '—'}`, 350, 86, { width: 200, align: 'right' });

    doc.moveTo(40, 105).lineTo(555, 105).strokeColor('#E2E8F0').stroke();

    // Bill to
    doc.fontSize(8).fillColor('#94A3B8').font('Helvetica-Bold').text('BILL TO', 40, 115);
    doc.fontSize(10).fillColor('#0F172A').font('Helvetica-Bold').text(invoice.party?.name || '—', 40, 128);
    doc.fontSize(9).fillColor('#475569').font('Helvetica')
      .text(invoice.party?.phone || '', 40, 141)
      .text(`GSTIN: ${invoice.party?.gstin || '—'}`, 40, 153);

    // Line items table header
    const tableTop = 180;
    doc.rect(40, tableTop, W, 18).fill('#F1F5F9');
    doc.fontSize(8).fillColor('#94A3B8').font('Helvetica-Bold');
    const cols = [40, 200, 280, 320, 370, 420, 470];
    ['ITEM', 'HSN', 'QTY', 'RATE', 'DISC', 'TAX', 'AMOUNT'].forEach((h, i) => {
      doc.text(h, cols[i], tableTop + 5, { width: 80 });
    });

    // Line items rows
    let y = tableTop + 24;
    doc.font('Helvetica').fillColor('#0F172A').fontSize(9);
    (invoice.lineItems || []).forEach((item, idx) => {
      if (idx % 2 === 0) doc.rect(40, y - 3, W, 18).fill('#FAFAFA').fillOpacity(1);
      doc.fillColor('#0F172A')
        .text(item.name, cols[0], y, { width: 155 })
        .text(item.hsn || '', cols[1], y, { width: 75 })
        .text(String(item.qty), cols[2], y, { width: 35 })
        .text(formatINR(item.rate), cols[3], y, { width: 45 })
        .text(formatINR(item.discount || 0), cols[4], y, { width: 45 })
        .text(`${item.gstRate || 0}%`, cols[5], y, { width: 45 })
        .text(formatINR(item.amount), cols[6], y, { width: 80 });
      y += 20;
    });

    doc.moveTo(40, y + 4).lineTo(555, y + 4).strokeColor('#E2E8F0').stroke();
    y += 16;

    // Totals
    const totals = [
      ['Subtotal', invoice.subtotal],
      ['Discount', invoice.totalDiscount],
      ...(invoice.cgst ? [['CGST', invoice.cgst], ['SGST', invoice.sgst]] : []),
      ...(invoice.igst ? [['IGST', invoice.igst]] : []),
      ...(invoice.roundOff ? [['Round Off', invoice.roundOff]] : []),
    ];
    totals.forEach(([l, v]) => {
      doc.fontSize(9).fillColor('#475569').font('Helvetica').text(l, 380, y, { width: 90 });
      doc.text(formatINR(v), 470, y, { width: 80, align: 'right' });
      y += 16;
    });

    doc.rect(370, y - 2, W - 330, 22).fill(PRI);
    doc.fontSize(11).fillColor('#fff').font('Helvetica-Bold')
      .text('TOTAL', 380, y + 4, { width: 90 })
      .text(formatINR(invoice.grandTotal), 470, y + 4, { width: 80, align: 'right' });
    y += 32;

    // Amount in words
    doc.fontSize(9).fillColor('#475569').font('Helvetica-Oblique')
      .text(amountInWords(invoice.grandTotal), 40, y, { width: W });
    y += 24;

    // Payment status
    doc.fontSize(9).fillColor('#0F172A').font('Helvetica')
      .text(`Payment Mode: ${invoice.paymentMode || '—'}  |  Status: ${invoice.status?.toUpperCase()}`, 40, y);
    if (invoice.balanceDue > 0) {
      doc.fillColor('#DC2626').text(`Balance Due: ${formatINR(invoice.balanceDue)}`, 40, y + 14);
    }

    // Footer
    const footerY = 780;
    doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor('#E2E8F0').stroke();
    doc.fontSize(8).fillColor('#94A3B8').font('Helvetica')
      .text(business?.invoiceTerms || 'Thank you for your business.', 40, footerY + 8, { width: W, align: 'center' });

    doc.end();
  });
};

module.exports = { generateInvoicePDF };
