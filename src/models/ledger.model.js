import mongoose from "mongoose";

const ledgerSchema = mongoose.Schema({
  account_name: { type: String, required: true, unique: true },
  account_balance: { type: Number, default: 0 },
  payouts: { type: Number, default: 0 }, // amount from withdrawal requests
  payins: { type: Number, default: 0 }, // amount from orders
  createdDate: { type: Date, default: Date.now },
});
const Ledger = mongoose.model("Ledger", ledgerSchema);
export default Ledger;
