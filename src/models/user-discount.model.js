import mongoose from "mongoose";

const userDiscountSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
  discount: { type: Number }, // % or naira for referral bonus
  count: { type: Number, default: 0 },
  limit: { type: Number, limit: 1 },
  discountType: { type: String, enum: ["deliveryFee", "taxFee", "subtotal", "vendor", "jointp", "referral"] },
  createdAt: { type: Date, default: Date.now },
  expiredAt: { type: Date, default: Date.now, expires: 172740 }, // 2 days
});

const UserDiscount = mongoose.model("UserDiscount", userDiscountSchema);

export default UserDiscount;
