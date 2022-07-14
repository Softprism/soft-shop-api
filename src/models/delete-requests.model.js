import mongoose from "mongoose";

const requestsSchema = mongoose.Schema({
  account_type: { type: String, enum: ["Store", "User", "Rider", "logistics"], required: true },
  // create account ID objectId field with ref path to account_type
  account_id: { type: mongoose.Schema.Types.ObjectId, refPath: "account_type" },
  createdDate: { type: Date, default: Date.now },
});

const Deletion = mongoose.model("deletion", requestsSchema);

export default Deletion;
