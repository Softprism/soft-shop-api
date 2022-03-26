import mongoose from "mongoose";
import { DateTime } from "luxon";

const now = new Date();
const ledgerSchema = mongoose.Schema({
  account_name: { type: String, required: true, unique: true },
  account_balance: { type: Number, default: 0 },
  payouts: { type: Number, default: 0 }, // amount from withdrawal requests
  payins: { type: Number, default: 0 }, // amount from orders
  createdDate: { type: String, default: DateTime.fromJSDate(now).toString() },
});
const Ledger = mongoose.model("Ledger", ledgerSchema);
export default Ledger;
