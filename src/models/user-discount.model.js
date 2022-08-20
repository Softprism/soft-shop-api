import mongoose from "mongoose";

const userDiscountSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
  discount: { type: Number }, // %
  discountType: { type: String, enum: ["deliveryFee", "taxFee", "subtotal", "vendor", "jointp"] },
  createdAt: { type: Date, default: Date.now },
  expiredAt: { type: Date, default: Date.now, expires: 172740 },
});

const UserDiscount = mongoose.model("UserDiscount", userDiscountSchema);

export default UserDiscount;
