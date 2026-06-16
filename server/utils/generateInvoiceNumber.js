const Invoice = require('../models/Invoice');

const generateInvoiceNumber = async (businessId, type, date) => {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const fyStart = month >= 4 ? year : year - 1;
  const fy = `${fyStart}-${String(fyStart + 1).slice(-2)}`;
  const prefix = type === 'sale' ? 'SALE' : 'PUR';

  const count = await Invoice.countDocuments({ businessId, type });
  const seq = String(count + 1).padStart(4, '0');
  return `ESP/${prefix}/${fy}/${seq}`;
};

module.exports = generateInvoiceNumber;
