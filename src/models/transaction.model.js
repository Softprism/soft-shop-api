import mongoose from "mongoose";
import { DateTime } from "luxon";

const now = new Date();

const transactionSchema = mongoose.Schema({
  amount: { type: Number },
  type: {
    type: String,
    enum: ["Credit", "Debit"]
  },
  to: {
    type: String,
    enum: ["Store", "User", "Ledger"]
  },
  receiver: { type: mongoose.Schema.Types.ObjectId, refPath: "to" },
  status: {
    type: String,
    enum: ["completed", "pending", "failed"],
    default: "pending"
  },
  ref: { type: String },
  createdDate: { type: String, default: DateTime.fromJSDate(now).toString() },
});
const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
