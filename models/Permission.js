import mongoose from "mongoose";

const PermissionSchema = new mongoose.Schema(
  {
    business: {
      type: Boolean,
      default: true,
    },
    residential: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Avoid model overwrite in dev
export default mongoose.models.Permission ||
  mongoose.model("Permission", PermissionSchema);
