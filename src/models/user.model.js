import mongoose from "mongoose";
import validator from "mongoose-validator";
import { DateTime } from "luxon";

const now = new Date();

const userSchema = mongoose.Schema({
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
  address: [
    {
      address_type: { type: String, required: true },
      value: { type: String, required: true },
      place_id: { type: String, required: true }
    },
  ],
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
  cards: [
    {
      card_index: { type: String },
      first_6digits: { type: String },
      last_4digits: { type: String },
      issuer: { type: String },
      country: { type: String },
      type: { type: String },
      token: { type: String },
      expiry: { type: String },
    }
  ],
  orders: [{ type: mongoose.Types.ObjectId, ref: "Order" }], // array to store multiple orders
  isVerified: { type: Boolean, required: true, default: false },
  pushNotifications: { type: Boolean, default: false },
  smsNotifications: { type: Boolean, default: false },
  promotionalNotifications: { type: Boolean, default: false },
  createdDate: { type: String, default: DateTime.fromJSDate(now).toString() },
});

const User = mongoose.model("User", userSchema);

export default User;
