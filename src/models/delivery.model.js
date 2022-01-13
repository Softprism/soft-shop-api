import mongoose from "mongoose";

const deliverySchema = mongoose.Schema({
  orderItems: { type: String, required: true },
  pickup: { type: String, required: true },
  dropOff: { type: String, required: true },
  receiver: { type: String, required: true },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider" },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["delivered", "pending", "accepted", "failed"], default: "pending" },
});

const Delivery = mongoose.model("Delivery", deliverySchema);

export default Delivery;
