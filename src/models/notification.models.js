import mongoose from "mongoose";

const NotificationSchema = mongoose.Schema({
  title: { type: String },
  message: { type: String },
  description: { type: String },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider" },
  status: { type: String, enum: ["unread", "read"], default: "unread" },
  extra_data: { type: mongoose.Schema.Types.ObjectId, refPath: "type" },
  type: {
    type: String,
    enum: ["Order", "Store", "Variant", "Product"]
  },
  createdDate: { type: Date, default: Date.now },
});
const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
