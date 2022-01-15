import mongoose from "mongoose";

const deliverySchema = mongoose.Schema({
  item: { type: String, required: true },
  pickup: { type: String, required: true },
  dropOff: { type: String, required: true },
  phone_number: { type: String, required: true },
  receiver: { type: String, required: true },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider" },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["delivered", "pending", "accepted", "failed"], default: "pending" },
  riderStatus: {
    type: String,
    enum: ["Arrive at pickup", "Start Delivery", "Complete Drop off"]
  },
  createdDate: { type: Date, default: Date.now },
});

const Delivery = mongoose.model("Delivery", deliverySchema);

export default Delivery;
