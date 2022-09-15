import mongoose from "mongoose";

const referralSchema = mongoose.Schema({
  referral_id: { type: String },
  reffered: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  total_credit: { type: Number, default: 0.00 },
  total_debit: { type: Number, default: 0.00 },
  isConsumer: { type: Boolean, default: false },
  account_number: { type: String },
  bank_code: { type: String },
  full_name: { type: String },
  bank_name: { type: String },
  pending_payout: { type: Boolean, default: false },
  account_balance: { type: Number, default: 0.00 }
});

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;
