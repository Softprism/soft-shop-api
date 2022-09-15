/* eslint-disable indent */
import mongoose from "mongoose";

const StoreSchema = mongoose.Schema({
  owner_name: { type: String, required: true },
  owner_email: { type: String, required: true },
  name: { type: String, required: true },
  images: {
    profilePhoto: {
      type: String,
      default: "https://soft-shop.app/uploads/store/802559-no-thumbnail.jpeg"
    },
    pictures: [{ type: String }],
  }, // array to store multiple images
  address: { type: String, required: true },
  place_id: { type: String },
  phone_number: { type: String, required: true },
  email: {
    type: String, unique: true, required: true, lowercase: true,
  },
  password: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  openingTime: { type: String, default: "22:00" },
  closingTime: { type: String, default: "07:00" },
  deliveryTime: { type: String, default: "15" },
  prepTime: { type: Number, default: 20 },
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
  isActive: { type: Boolean, default: false }, // this shows if a store is available to receive orders
  resetPassword: { type: String, default: "initiated", enum: ["initiated", "done"] },
  pendingUpdates: { type: Boolean, default: false },
  pendingWithdrawal: { type: Boolean, default: false },
  pushNotifications: { type: Boolean, default: false },
  smsNotifications: { type: Boolean, default: false },
  promotionalNotifications: { type: Boolean, default: false },
  orderPushDeviceToken: [{ type: String }],
  vendorPushDeviceToken: [{ type: String }],
  tax: { type: String },
  account_details: {
    account_balance: { type: Number, default: 0.00 },
    total_credit: { type: Number, default: 0.00 },
    total_debit: { type: Number, default: 0.00 },
    account_number: { type: String },
    bank_code: { type: String },
    full_name: { type: String },
    bank_name: { type: String },
    pending_payout: { type: Boolean },
  },
  createdAt: { type: Date, default: Date.now },
},

  { timestamps: true });

StoreSchema.index({ location: "2dsphere" });
const Store = mongoose.model("Store", StoreSchema);

export default Store;
