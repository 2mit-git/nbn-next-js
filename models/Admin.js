// models/Admin.js
import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  number: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "admin",
  },
}, {
  timestamps: true,
});

// Avoid model overwrite in dev
export default mongoose.models.Admin ||
  mongoose.model("Admin", AdminSchema);
