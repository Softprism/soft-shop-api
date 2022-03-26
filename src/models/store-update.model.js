import mongoose from "mongoose";
import { DateTime } from "luxon";

const now = new Date();

const StoreUpdateSchema = mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    newDetails: {
      name: { type: String },
      address: { type: String },
      place_id: { type: String },
      phone_number: { type: String },
      email: { type: String, lowercase: true, },
      category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      location: {
        type: { type: String, default: "Point", enum: ["Point"] },
        coordinates: [Number],
      },
      tax: { type: Number },
      account_details: {
        account_number: { type: String },
        full_name: { type: String },
        bank_code: { type: String },
        bank_name: { type: String }
      }
    },
    createdAt: { type: String, default: DateTime.fromJSDate(now).toString() },
  },
  { timestamps: true }
);

const StoreUpdate = mongoose.model("StoreUpdate", StoreUpdateSchema);

export default StoreUpdate;
