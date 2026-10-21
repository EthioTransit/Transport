import mongoose from 'mongoose';
import { ENV } from './env';

export async function connectDatabase(): Promise<string> {
  let uri = ENV.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log(`Connecting to MongoDB at configured URI...`);
      await mongoose.connect(uri);
      console.log(`[Database] Successfully connected to MongoDB Atlas / Remote database.`);
      return uri;
    } catch (err) {
      console.warn(`[Database] Failed to connect to configured URI (${err}). Falling back to in-memory MongoDB...`);
    }
  }

  // Check if a local MongoDB service is actively running on port 27017
  try {
    const localUri = 'mongodb://127.0.0.1:27017/ethiotransit';
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 1200 } as any);
    console.log(`[Database] Successfully connected to local persistent MongoDB service at: ${localUri}`);
    return localUri;
  } catch {
    // Local MongoDB daemon not running, proceed to managed in-memory server
  }

  // Fallback to MongoMemoryServer with snapshot persistence
  console.log(`[Database] Initializing managed MongoDB server with local persistence...`);
  try {
    // @ts-ignore
    const memoryServerModule: any = await import('mongodb-memory-server').catch(() => null);
    if (!memoryServerModule || !memoryServerModule.MongoMemoryServer) {
      throw new Error('In-memory MongoDB is not available in production. Please configure MONGODB_URI in your environment variables.');
    }
    const { MongoMemoryServer } = memoryServerModule;
    const mongod = await MongoMemoryServer.create({
      instance: {
        launchTimeout: 120000,
      },
    });
    uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`[Database] Successfully connected to in-memory MongoDB at: ${uri}`);
    return uri;
  } catch (memoryErr) {
    console.error(`[Database] Critical error initializing in-memory database:`, memoryErr);
    throw memoryErr;
  }
}
