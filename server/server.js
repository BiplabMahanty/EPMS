require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// // 👇 ADD THESE 2 LINES
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);


  console.log('Connecting to MongoDB...');
  console.log(`Using connection string: ${process.env.MONGO_URI}`);
connectDB().then(() => {
  app.listen(PORT, () => console.log(`ESP server running on port ${PORT}`));
}).catch((err) => {
  console.error('DB connection failed:', err);
  process.exit(1);
});
  