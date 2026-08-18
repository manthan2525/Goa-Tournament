import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/goa_tournament';
    
    // Set connection timeout to 2.5s for fast fallback to in-memory DB if local mongo daemon is down
    mongoose.set('strictQuery', false);
    
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2500,
      });
      console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
    } catch (localErr) {
      console.warn(`[MongoDB] Local connection to ${mongoUri} failed (${localErr.message}).`);
      console.log('[MongoDB] Initializing MongoMemoryServer (In-Memory database) for development...');
      
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[MongoDB] Connected to in-memory database at ${memUri}`);
    }
  } catch (error) {
    console.error(`[MongoDB Error] Critical connection failure: ${error.message}`);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.connection.close();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
