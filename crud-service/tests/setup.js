import mongoose from 'mongoose';

beforeAll(async () => {
  // Connect to the database
  await mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  // Disconnect from the database
  await mongoose.disconnect();
});
