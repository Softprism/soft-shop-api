import mongoose from "mongoose";

const tokenSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      ref: "User",
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600,
    },
  },
  {
    timestamps: true,
  }
);

const Token = mongoose.model("Token", tokenSchema);

export default Token;
