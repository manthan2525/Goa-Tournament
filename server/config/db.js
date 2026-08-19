import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.warn('⚠️ [MongoDB Warning] MONGODB_URI / MONGO_URI is not set in environment variables.');
      console.warn('⚠️ Please add MONGODB_URI in your environment or Render Dashboard.');
      return;
    }

    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log(
      `✅ [MongoDB] Connected successfully to Atlas: ${conn.connection.host}/${conn.connection.name}`
    );
  } catch (error) {
    console.error(`❌ [MongoDB Error] Connection failed: ${error.message}`);
    console.error('👉 Verify your MongoDB Atlas connection string, database user password, and Network Access (allow 0.0.0.0/0 on Atlas).');
  }
};

export const closeDB = async () => {
  await mongoose.connection.close();
  console.log('[MongoDB] Connection closed');
};
