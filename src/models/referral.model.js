import mongoose from "mongoose";

const referralSchema = mongoose.Schema({
  referral_id: { type: String },
  reffered: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  total_credit: { type: Number, default: 0.00 },
  total_debit: { type: Number, default: 0.00 },
  account_number: { type: String, default: "" },
  bank_code: { type: String, default: "" },
  full_name: { type: String, default: "" },
  bank_name: { type: String, default: "" },
  pending_payout: { type: Boolean, default: false },
  account_balance: { type: Number, default: 0.00 }
});

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;
