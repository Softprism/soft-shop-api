import mongoose from "mongoose";

const UserconfigSchema = mongoose.Schema({
  user: { type: String, enum: ["User", "Store", "Logistics", "Rider", "Ledger", "admins"] },
  userId: { type: mongoose.Schema.Types.ObjectId, refPath: "user", unique: true },
  fee: { type: Number }
});
const Userconfig = mongoose.model("Userconfig", UserconfigSchema);
export default Userconfig;
