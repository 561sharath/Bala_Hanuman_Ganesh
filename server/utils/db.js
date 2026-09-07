const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  let uri = process.env.MONGODB_URI;
  
  if (!uri || uri.trim() === '') {
    console.log('No MONGODB_URI provided in environment. Initializing in-memory MongoDB instance for local testing...');
    mongoMemoryServer = await MongoMemoryServer.create();
    uri = mongoMemoryServer.getUri();
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected successfully to: ${mongoose.connection.host}`);
    
    // Seed initial default collectors and admin users if empty
    await seedDefaultCollectors();
    const seedAdmins = require('./seedAdmins');
    await seedAdmins();
  } catch (error) {
    console.warn(`Failed to connect to primary MongoDB URI (${uri}). Error: ${error.message}`);
    if (!mongoMemoryServer) {
      console.log('Falling back to MongoMemoryServer for seamless execution...');
      try {
        mongoMemoryServer = await MongoMemoryServer.create();
        const fallbackUri = mongoMemoryServer.getUri();
        await mongoose.connect(fallbackUri);
        console.log(`Connected to fallback MongoMemoryServer: ${mongoose.connection.host}`);
        await seedDefaultCollectors();
      } catch (fallbackErr) {
        console.error('MongoMemoryServer fallback failed:', fallbackErr);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

const seedDefaultCollectors = async () => {
  try {
    const Collector = require('../models/Collector');
    const defaultNames = ['Ravi', 'Murali', 'Diwakar', 'Anil'];

    for (const name of defaultNames) {
      const exists = await Collector.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      if (!exists) {
        await Collector.create({ name, isDefault: true });
        console.log(`Seeded default collector: ${name}`);
      }
    }
  } catch (err) {
    console.error('Error seeding default collectors:', err);
  }
};

module.exports = connectDB;
