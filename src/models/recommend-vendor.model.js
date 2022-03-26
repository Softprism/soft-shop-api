import mongoose from "mongoose";
import { DateTime } from "luxon";

const now = new Date();
const recommendSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, ref: "User", },
    state: { type: String, required: true },
    city: { type: String, required: true },
    instagram: { type: String },
    createdAt: { type: String, default: DateTime.fromJSDate(now).toString() },
  },
  { timestamps: true }
);

const Recommend = mongoose.model("Recommend", recommendSchema);

export default Recommend;
