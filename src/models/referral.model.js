import mongoose from "mongoose";

const referralSchema = mongoose.Schema({
  referral_id: { type: String },
  reffered: [{ type: mongoose.Types.ObjectId, ref: "User" }],
});

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;
