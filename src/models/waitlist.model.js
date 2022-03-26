import mongoose from "mongoose";
import { DateTime } from "luxon";

const now = new Date();

const waitlistSchema = mongoose.Schema(
  {
    email: { type: String, required: true, ref: "User", },
    createdAt: { type: String, default: DateTime.fromJSDate(now).toString() },
  },
  { timestamps: true }
);

const Waitlist = mongoose.model("Waitlist", waitlistSchema);

export default Waitlist;
