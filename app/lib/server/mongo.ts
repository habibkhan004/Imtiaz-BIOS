import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var __imtiazMongoPromise: Promise<typeof mongoose> | undefined;
}

export function hasMongoUri(): boolean {
  return Boolean(process.env.MONGODB_URI?.trim());
}

export async function connectMongo(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!global.__imtiazMongoPromise) {
    global.__imtiazMongoPromise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15_000,
    });
  }

  try {
    await global.__imtiazMongoPromise;
    return mongoose;
  } catch (err) {
    global.__imtiazMongoPromise = undefined;
    throw err;
  }
}

export function mongoReadyState(): string {
  const states = ["disconnected", "connected", "connecting", "disconnecting"] as const;
  return states[mongoose.connection.readyState] ?? "unknown";
}
