const mongoose = require('mongoose');

const connectDB = async () => {
  console.log('Connecting to MongoDB...');
  console.log(`Using connection string: ${process.env.MONGO_URI}`);
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // force IPv4, avoids ENOBUFS on dual-stack DNS
  });
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;
