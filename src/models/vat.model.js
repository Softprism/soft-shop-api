import mongoose from "mongoose";

const VatSchema = mongoose.Schema({
  amount: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  onOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  paidBy: { type: String, required: true, enum: ["Customer", "Vendor", "Delivery Partner"] }
});

const Vat = mongoose.model("Vat", VatSchema);
export default Vat;
