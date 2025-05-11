import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ["FTTP", "HFC", "FTTN_FTTC_FTTB", "Wireless"],
  },
  speed: {
    type: String,
    required: true,
  },

  // ── New fields ────────────────────────────────────────────────
  title: {
    type: String,
    required: true,
    trim: true,
  },
  subtitle: {
    type: String,
    trim: true,
  },
  actualPrice: {
    type: Number,
    required: true,
  },
  discountPrice: {
    type: Number,
    default: 0,
  },
  termsAndConditions: {
    type: [String],
    trim: true,
  },
  recommendation: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Avoid model overwrite in dev
export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
