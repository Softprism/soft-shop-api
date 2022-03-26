import mongoose from "mongoose";
import { DateTime } from "luxon";

const now = new Date();
const logsSchema = mongoose.Schema({
  action: { type: String },
  actor: { type: String },
  message: { type: String },
  createdDate: { type: String, default: DateTime.fromJSDate(now).toString() },
});
const logs = mongoose.model("Log", logsSchema);
export default logs;
