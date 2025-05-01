// models/ApiKey.js
import mongoose from "mongoose";

const ApiKeySchema = new mongoose.Schema({
  geoapify:  { type: String, required: true },
  nbn:       { type: String, required: true },
  recaptcha: { type: String, required: true },
});

// Avoid model overwrite in dev/hot-reload
export default mongoose.models.ApiKey ||
       mongoose.model("ApiKey", ApiKeySchema);
