import mongoose from "mongoose";
import { DateTime } from "luxon";

const now = new Date();
const deliverySchema = mongoose.Schema({
  item: { type: String, required: true },
  pickup: { type: String, required: true },
  dropOff: { type: String, required: true },
  phone_number: { type: String, required: true },
  receiver: { type: String, required: true },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider" },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
  status: { type: String, enum: ["delivered", "pending", "accepted", "failed"], default: "pending" },
  riderStatus: {
    type: String,
    enum: ["Arrive at pickup", "Start Delivery", "Complete Drop off", "Cancelled", "pending"],
    default: "pending",
  },
  createdDate: { type: String, default: DateTime.fromJSDate(now).toString() },
});

const Delivery = mongoose.model("Delivery", deliverySchema);

export default Delivery;
