import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      console.warn('⚠️ [MongoDB Warning] MONGO_URI is not set in environment variables.');
      console.warn('⚠️ Please add MONGO_URI in your environment or Render Dashboard.');
      return null;
    }

    mongoose.set('strictQuery', false);

    // Explicitly set dbName to 'goa_tournament' so Atlas connects to the production DB
    // even if the MONGO_URI string omits the database path (e.g. /?retryWrites=true)
    const conn = await mongoose.connect(uri, {
      dbName: 'goa_tournament',
      serverSelectionTimeoutMS: 15000,
    });

    console.log(
      `✅ [MongoDB] Connected successfully to Atlas: ${conn.connection.host}/${conn.connection.name}`
    );
    return conn;
  } catch (error) {
    console.error(`❌ [MongoDB Error] Connection failed: ${error.message}`);
    console.error('👉 Verify your MongoDB Atlas connection string, database user password, and Network Access (allow 0.0.0.0/0 on Atlas).');
    throw error;
  }
};

export const closeDB = async () => {
  await mongoose.connection.close();
  console.log('[MongoDB] Connection closed');
};
