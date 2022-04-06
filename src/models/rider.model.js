import mongoose from "mongoose";
import validator from "mongoose-validator";

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
    default: "https://soft-shop.app/../uploads/store/292672-edit.png"
  },
  isVerified: { type: Boolean, required: true, default: false },
  orders: [{ type: mongoose.Types.ObjectId, ref: "Order" }], // array to store multiple orders
  createdDate: { type: Date, default: Date.now },
  pushNotifications: { type: Boolean, default: false },
  smsNotifications: { type: Boolean, default: false },
  pushDeviceToken: { type: String },
  promotionalNotifications: { type: Boolean, default: false },
  pendingWithdrawal: { type: Boolean, default: false },
  account_details: {
    account_balance: { type: Number, default: 0.00 },
    total_credit: { type: Number, default: 0.00 },
    total_debit: { type: Number, default: 0.00 },
    account_number: { type: String },
    bank_code: { type: String },
    full_name: { type: String },
    bank_name: { type: String },
    pending_payout: { type: Boolean },
  }
});

const Rider = mongoose.model("Rider", riderSchema);

export default Rider;
