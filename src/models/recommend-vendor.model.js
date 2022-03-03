import mongoose from "mongoose";

const recommendSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, ref: "User", },
    state: { type: String, required: true },
    city: { type: String, required: true },
    instagram: { type: String }
  },
  { timestamps: true }
);

const Recommend = mongoose.model("Recommend", recommendSchema);

export default Recommend;
