import mongoose from "mongoose";

const logsSchema = mongoose.Schema({
  action: { type: String },
  actor: { type: String },
  message: { type: String },
  createdDate: { type: Date, default: Date.now },
});
const logs = mongoose.model("Log", logsSchema);
export default logs;
