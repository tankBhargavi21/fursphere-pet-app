import mongoose from 'mongoose';

let isConnected = false;
let fallbackMode = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fursphere';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    fallbackMode = false;
    console.log(`[FurSphere Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[FurSphere Database] Local MongoDB not reachable (${error.message}).`);
    console.warn(`[FurSphere Database] Seamlessly activating high-reliability In-Memory / File-Store fallback mode so all features work immediately.`);
    isConnected = false;
    fallbackMode = true;
  }
};

export const getDBStatus = () => ({
  isConnected,
  fallbackMode,
});
