import mongoose from "mongoose";

const transactionSchema = mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["Credit", "Debit"],
    required: true,
  },
  to: {
    type: String,
    enum: ["Store", "User", "Ledger", "Rider", "logistics"],
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "to",
    required: true,
  },
  status: {
    type: String,
    enum: [
      "completed", // payment has been sent
      "approved", // admin as confirmed payment
      "pending", // payment is pending
      "failed" // payment failed
    ],

    default: "pending"
  },
  ref: {
    type: String,
    required: true,
  },
  fee: {
    type: Number,
    required: true,
    default: 0.00
  },
  createdDate: { type: Date, default: Date.now },
});
const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
