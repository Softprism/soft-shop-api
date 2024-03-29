import mongoose from "mongoose";

const waitlistSchema = mongoose.Schema(
  {
    email: { type: String, required: true, ref: "User", },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Waitlist = mongoose.model("Waitlist", waitlistSchema);

export default Waitlist;
