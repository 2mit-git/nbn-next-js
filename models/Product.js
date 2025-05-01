// models/Product.js
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
  price: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Product ||
       mongoose.model("Product", ProductSchema);
