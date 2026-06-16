const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // force IPv4, avoids ENOBUFS on dual-stack DNS
  });
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;
