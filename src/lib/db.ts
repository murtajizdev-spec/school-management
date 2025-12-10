import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const connection: { isConnected?: number; promise?: Promise<typeof mongoose> } =
  {};
let memoryServer: MongoMemoryServer | null = null;

export const connectDB = async () => {
  if (connection.isConnected) {
    return;
  }

  let uri = process.env.MONGODB_URI;

  if (!uri) {
    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create();
      console.warn(
        "MONGODB_URI is not set. Using in-memory MongoDB for this session."
      );
    }
    uri = memoryServer.getUri();
  }

  if (!connection.promise) {
    connection.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  const db = await connection.promise;
  connection.isConnected = db.connections[0].readyState;
};

export const disconnectDB = async () => {
  if (!connection.isConnected) {
    return;
  }

  await mongoose.disconnect();
  connection.isConnected = undefined;
  connection.promise = undefined;

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

