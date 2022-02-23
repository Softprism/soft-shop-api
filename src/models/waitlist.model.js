import mongoose from "mongoose";

const waitlistSchema = mongoose.Schema(
  {
    email: { type: String, required: true, ref: "User", }
  },
  { timestamps: true }
);

const Waitlist = mongoose.model("Waitlist", waitlistSchema);

export default Waitlist;
