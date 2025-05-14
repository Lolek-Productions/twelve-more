import mongoose from 'mongoose';

export const connect = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log('Already connected to MongoDB');
    return;
  }

  const dbName = (!process.env.NEXT_PUBLIC_ENV || process.env.NEXT_PUBLIC_ENV !== 'local')
  ? 'twelve-more-app'
  : 'development-main';

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};