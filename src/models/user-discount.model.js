import mongoose from "mongoose";

const userDiscountSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  discount: { type: Number }, // %
  discountType: { type: String, enum: ["deliveryFee", "taxFee", "subtotal"] },
  createdAt: { type: Date, default: Date.now },
  expiredAt: { type: Date, default: Date.now, expires: "5m" },
});

const UserDiscount = mongoose.model("UserDiscount", userDiscountSchema);

export default UserDiscount;
