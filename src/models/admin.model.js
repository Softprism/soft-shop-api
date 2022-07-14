import mongoose from "mongoose";

const adminSchema = mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  image: { type: String, required: true },
  email: { type: String, required: true },
  phone_number: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Roles" },
  verified: { type: Boolean, default: "false" },
  createdDate: { type: Date, default: Date.now },
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
