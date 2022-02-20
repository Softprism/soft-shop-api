import mongoose from "mongoose";

const ReviewSchema = mongoose.Schema(
  {
    star: { type: Number },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", },
    delivery: { type: mongoose.Schema.Types.ObjectId, ref: "Delivery", },
    rider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", },
    text: { type: String },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", ReviewSchema);

export default Review;
