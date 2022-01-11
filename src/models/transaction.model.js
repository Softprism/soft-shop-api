import mongoose from "mongoose";

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
  createdDate: { type: Date, default: Date.now },
});
const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;