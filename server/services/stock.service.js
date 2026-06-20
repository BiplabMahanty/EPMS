const mongoose = require('mongoose');
const Product = require('../models/Product');
const StockLedger = require('../models/StockLedger');

const updateStock = async (productId, quantity, type, reference, reason, businessId, createdBy, session) => {
  console.log(`Updating stock for product ${productId}: ${type} ${quantity} (reason: ${reason})`);
  const product = await Product.findById(productId).session(session);
  console.log('Current stock:', product ? product.currentStock : 'Product not found');
  if (!product) throw new Error(`Product ${productId} not found`);

  product.currentStock += quantity;
  await product.save({ session });
  console.log('New stock:', product.currentStock);

  await StockLedger.create([{
    product: product._id,
    quantity,
    type,
    reference,
    reason,
    balanceAfter: product.currentStock,
    businessId,
    createdBy,
  }], { session });
  console.log('Stock ledger entry created');

  return product.currentStock;
};

module.exports = { updateStock };
