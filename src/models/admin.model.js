import mongoose from "mongoose";
import { DateTime } from "luxon";

const now = new Date();
const adminSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  createdDate: { type: String, default: DateTime.fromJSDate(now).toString() },
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
