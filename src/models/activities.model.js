import mongoose from "mongoose";

const activitySchema = mongoose.Schema({
  actor: { type: String, enum: ["User", "Store", "Logistics", "Rider", "Ledger", "admins"] },
  actorId: { type: mongoose.Schema.Types.ObjectId, refPath: "actor" },
  title: { type: String },
  description: { type: String },
  createdDate: { type: Date, default: Date.now }

});

const Activities = mongoose.model("Activities", activitySchema);

export default Activities;
