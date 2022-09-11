import mongoose from "mongoose";

const referralSchema = mongoose.Schema({
  referral_id: { type: String },
  reffered: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  account_balance: { type: Number, default: 0.00 }
});

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;
