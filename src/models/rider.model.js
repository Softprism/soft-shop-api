import mongoose from "mongoose";
import validator from "mongoose-validator";
import { DateTime } from "luxon";

const now = new Date();

const riderSchema = mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    trim: true,
    minLength: [3, "first name field should be atleast more than 3 characters"],
    validate: [
      validator({
        validator: "isAlpha",
        message: "You can only use alphabets for the first name field",
      }),
    ],
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
    minLength: [3, "last name field should be atleast more than 3 characters"],
    validate: [
      validator({
        validator: "isAlpha",
        message: "You can only use alphabets for the last name field",
      }),
    ],
  },
  phone_number: {
    type: String,
    required: true,
    trim: true,
    validate: [
      validator({
        validator: "isMobilePhone",
        message: "Please enter a correct phone number",
      }),
    ],
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    validate: [
      validator({
        validator: "isEmail",
        message: "Please enter a valid email address",
      }),
    ],
  },
  password: {
    type: String,
    required: true,
  },
  profilePhoto: {
    type: String,
    default: "https://soft-shop.app/../uploads/store/292672-edit.svg"
  },
  isVerified: { type: Boolean, required: true, default: false },
  orders: [{ type: mongoose.Types.ObjectId, ref: "Order" }], // array to store multiple orders
  createdDate: { type: String, default: DateTime.fromJSDate(now).toString() },
  pushNotifications: { type: Boolean, default: false },
  smsNotifications: { type: Boolean, default: false },
  promotionalNotifications: { type: Boolean, default: false },
});

const Rider = mongoose.model("Rider", riderSchema);

export default Rider;
