// File: models/ApiKey.js
import mongoose from "mongoose";

const ApiKeySchema = new mongoose.Schema({
  TWILIO_ACCOUNT_SID: { type: String, required: true },
  TWILIO_AUTH_TOKEN: { type: String, required: true },
  TWILIO_SERVICE_SID: { type: String, required: true },
  GHL_WEBHOOK: { type: String, required: true },
  GEO_API_KEY: { type: String, required: true },
  RAPIDAPI_KEY: { type: String, required: true },
});

// Prevent model overwrite during hot-reload in development
export default mongoose.models.ApiKey || mongoose.model("ApiKey", ApiKeySchema);
