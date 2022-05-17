import mongoose from "mongoose";

const logisticsCompanySchema = mongoose.Schema({
  email: { type: String, required: true },
  companyName: { type: String, required: true },
  image: { type: String },
  companyAddress: { type: String, required: true },
  location: {
    type: { type: String, default: "Point", enum: ["Point"] },
    coordinates: [Number],
  },
  placeId: { type: String },
  verified: { type: Boolean, default: false },
  password: { type: String, required: true },
  account_details: {
    account_balance: { type: Number, default: 0.00 },
    total_credit: { type: Number, default: 0.00 },
    total_debit: { type: Number, default: 0.00 },
    account_number: { type: String },
    bank_code: { type: String },
    full_name: { type: String },
    bank_name: { type: String },
    isVerified: { type: Boolean, default: false },
  },
  pendingWithdrawal: { type: Boolean, default: false },
  createdDate: { type: Date, default: Date.now },
});

logisticsCompanySchema.index({ location: "2dsphere" });
const Logistics = mongoose.model("logistics", logisticsCompanySchema);

export default Logistics;
