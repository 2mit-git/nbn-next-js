// lib/dbConnect.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Define MONGODB_URI in .env.local");
}

// log once when Mongoose makes the initial connection
mongoose.connection.once("open", () => {
  console.log("✅ [dbConnect] MongoDB connection open");
});
// log on any later reconnect/error
mongoose.connection.on("error", (err) => {
  console.error("❌ [dbConnect] MongoDB connection error:", err);
});

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((mongooseInstance) => {
        // you’ll see “✅ [dbConnect] MongoDB connection open” above
        return mongooseInstance;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
