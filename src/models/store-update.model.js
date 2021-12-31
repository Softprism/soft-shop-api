import mongoose from "mongoose";

const StoreUpdateSchema = mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    newDetails: {
      name: { type: String },
      address: { type: String },
      phone_number: { type: String },
      email: { type: String, lowercase: true, },
      category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      location: {
        type: { type: String, default: "Point", enum: ["Point"] },
        coordinates: [Number],
      },
      updateDetails: { type: Boolean },
      tax: { type: Number },
    }
  },
  { timestamps: true }
);

const StoreUpdate = mongoose.model("StoreUpdate", StoreUpdateSchema);

export default StoreUpdate;