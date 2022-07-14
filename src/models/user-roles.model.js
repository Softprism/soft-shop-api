import mongoose from "mongoose";

const rolesSchema = mongoose.Schema({
  name: { type: String, required: true, enum: ["admin", "owner", "finance", "support", "logistics"] },
  level: { type: Number, required: true, enum: [1, 2, 3, 4, 5] },
  createdDate: { type: Date, default: Date.now }
});

const Roles = mongoose.model("Roles", rolesSchema);

export default Roles;
