import mongoose from "mongoose";
import { DateTime } from "luxon";

const now = new Date();
const NotificationSchema = mongoose.Schema({
  title: { type: String },
  message: { type: String },
  description: { type: String },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
  status: { type: String, enum: ["unread", "read"], default: "unread" },
  extra_data: { type: mongoose.Schema.Types.ObjectId, refPath: "type" },
  type: {
    type: String,
    enum: ["Order", "Store", "Variant", "Product"]
  },
  createdDate: { type: String, default: DateTime.fromJSDate(now).toString() },
});
const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
