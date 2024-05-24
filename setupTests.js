import mongoose from 'mongoose';

// Mock the database URI for testing purposes
const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/testdb';

beforeAll(async () => {
  // Connect to the database
  await mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  // Disconnect from the database
  await mongoose.disconnect();
});
