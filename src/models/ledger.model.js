import mongoose from "mongoose";

const ledgerSchema = mongoose.Schema({
  account_name: { type: String },
  account_balance: { type: Number },
  payouts: { type: Number }, // amount from withdrawal requests
  payins: { type: Number }, // amount from orders
  createdDate: { type: Date, default: Date.now },
});
const Ledger = mongoose.model("Ledger", ledgerSchema);
export default Ledger;
