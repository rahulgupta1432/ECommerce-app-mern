// ./db/database.js
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
    });

    console.log(`MongoDB connected to server ${mongoose.connection.host}`);
  } catch (error) {
    console.log(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.log(`Error disconnecting from MongoDB: ${error.message}`);
    process.exit(1);
  }
};



export default connectDB;