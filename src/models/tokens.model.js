import mongoose from "mongoose";
import { DateTime } from "luxon";

const now = new Date();

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
      enum: ["user-forgot-password", "rider-forgot-password", "user-signup", "rider-signup"],
      required: true,
    },
    createdAt: { type: String, default: DateTime.fromJSDate(now).toString() },
  },
  {
    timestamps: true,
  }
);

const Token = mongoose.model("Token", tokenSchema);

export default Token;
