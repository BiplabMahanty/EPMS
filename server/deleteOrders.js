require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const Invoice = require('./models/Invoice');

const MONGO_URI = process.env.MONGO_URI;

console.log('Using MongoDB URI:', MONGO_URI);

async function deleteAllInvoices() {
  try {
    await mongoose.connect(MONGO_URI);

    const result = await Invoice.deleteMany({});

    console.log(`✅ Deleted ${result.deletedCount} invoices`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error deleting invoices:', error);
  }
}

deleteAllInvoices();