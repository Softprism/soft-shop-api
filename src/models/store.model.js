import mongoose from "mongoose";

const StoreSchema = mongoose.Schema({
  name: { type: String, required: true },
  images: [{ type: String, required: true }], // array to store multiple images
  address: { type: String, required: true },
  phone_number: { type: String, required: true },
  email: {
    type: String, unique: true, required: true, lowercase: true,
  },
  password: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  openingTime: { type: String, required: true },
  closingTime: { type: String, required: true },
  deliveryTime: { type: Number },
  prepTime: { type: Number },
  location: {
    type: { type: String, default: "Point", enum: ["Point"] },
    coordinates: [Number],
  },
  labels: [
    {
      labelTitle: { type: String },
      labelThumb: { type: String }, // Label thumbnail
    },
  ],
  isVerified: { type: Boolean, default: false }, // this validates a store on the platform
  isActive: { type: Boolean, default: true }, // this shows if a store is available to receive orders
  resetPassword: { type: Boolean, default: false },
  pendingUpdates: { type: Boolean, default: false },
  createdDate: { type: Date, default: Date.now },
  tax: { type: String },
  account_details: {
    account_balance: { type: Number, default: 0.00 },
    total_credit: { type: Number, default: 0.00 },
    total_debit: { type: Number, default: 0.00 },
    account_number: { type: String },
    full_name: { type: String },
    bank_name: { type: String }
  }
});

const Store = mongoose.model("Store", StoreSchema);

export default Store;
