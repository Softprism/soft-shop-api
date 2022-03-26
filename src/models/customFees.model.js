import mongoose from "mongoose";
import { DateTime } from "luxon";

const now = new Date();
const CustomFeesSchema = mongoose.Schema({
  title: { type: String },
  amount: { type: Number },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  createdDate: { type: String, default: DateTime.fromJSDate(now).toString() },
});
const CustomFee = mongoose.model("CustomFee", CustomFeesSchema);
export default CustomFee;
