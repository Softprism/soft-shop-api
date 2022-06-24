import bcrypt from "bcryptjs";
import capitalize from "capitalize";
import mongoose from "mongoose";
import Rider from "../models/rider.model";
import Token from "../models/tokens.model";

import {
  sendPasswordChangeMail, sendForgotPasswordMail, sendRiderPayoutRequestMail
} from "../utils/sendMail";
import getOTP from "../utils/sendOTP";
import getJwt from "../utils/jwtGenerator";
import { sendForgotPasswordSMS } from "../utils/sendSMS";
import Transaction from "../models/transaction.model";
import { createTransaction } from "./transaction.service";
import Ledger from "../models/ledger.model";
import Logistics from "../models/logistics-company.model";

const getAllRiders = async (urlParams) => {
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);

  delete urlParams.limit;
  delete urlParams.skip;
  delete urlParams.page;

  const riders = await Rider.find(urlParams)
    .select("-password -orders")
    .sort({ createdDate: -1 }) // -1 for descending sorting
    .skip(skip)
    .limit(limit);

  return riders;
};

// send otp to Verify rider email before sign up
const verifyEmailAddress = async ({ email }) => {
  // check if rider exists
  let rider = await Rider.findOne({ email });
  if (rider) {
    return { err: "This email is being used by another rider.", status: 409 };
  }

  let token = await getOTP("rider-signup", email);

  // send otp

  return { msg: "OTP sent!", email, otp: token.otp };
};

const registerRider = async (riderParam) => {
  console.log(riderParam);
  const {
    first_name, last_name, email, phone_number, password, corporate, company_id
  } = riderParam;

  // check if rider exists
  let rider = await Rider.findOne({ email });
  if (rider) {
    return { err: "Rider with this email already exists.", status: 409 };
  }

  // check if server is in production
  if (process.env.NODE_ENV === "production" && company_id && corporate === false) {
    // check if company exists
    let company = await Logistics.findById(company_id);
    if (!company) {
      return { err: "Company does not exists.", status: 404 };
    }
  }

  let isVerified = false;

  // check if server is in production
  if (process.env.NODE_ENV === "production") {
    // verify rider's signup token
    let signupToken = await Token.findOne({ _id: riderParam.token, email });
    if (signupToken) {
      isVerified = true;
    } else {
      return { err: "Email Authentication failed. Please try again.", status: 409 };
    }
  }
  // Create rider Object
  const newRider = {
    first_name: capitalize(first_name),
    last_name: capitalize(last_name),
    email,
    phone_number,
    password,
    isVerified,
    corporate,
    company_id
  };
    // Save rider to db
  const createdRider = await Rider.create(newRider);

  // delete sign up token
  await Token.findByIdAndDelete(riderParam.token);

  let riderToken = await getJwt(createdRider._id, "rider");

  return { createdRider, riderToken };
};

// Login rider
const loginRider = async (loginParam) => {
  const { email, password } = loginParam;
  // Find rider with email
  let rider = await Rider.findOne({
    $or: [{ email }, { phone: email }],
  });
  if (!rider) {
    return {
      err: "The email entered is not registered, please try again.",
      status: 401,
    };
  }
  // Check if password matches with stored hash
  const isMatch = await bcrypt.compare(password, rider.password);

  if (!isMatch) {
    return {
      err: "The password entered in incorrect, please try again.",
      status: 401,
    };
  }

  if (process.env.NODE_ENV === "production" && rider.isVerified === false) {
    return { err: "Sorry, your is yet to be verified, kindly contact support@soft-shop.app.", status: 401 };
  }
  if (rider.isVerified === false) {
    return { err: "Sorry, your is yet to be verified, kindly contact support@soft-shop.app", status: 401 };
  }

  // Define payload for token
  let token = await getJwt(rider._id, "rider");

  return { rider, token };
};

const validateToken = async ({ type, otp, email }) => {
  // find token
  let riderToken = await Token.findOne({
    otp,
    email,
    type,
  });

  if (!riderToken) {
    return {
      err: "The OTP entered is incorrect, please try again.",
      status: 406,
    };
  }

  return riderToken;
};

const requestPasswordToken = async ({ email }) => {
  // verify if rider exists, throws error if not
  let findRider = await Rider.findOne({ email });
  if (!findRider) {
    return {
      err: "Rider does not exists.",
      status: 404,
    };
  }

  let token = await getOTP("rider-forgot-password", email);

  // // send otp
  await sendForgotPasswordMail(email, token.otp);
  await sendForgotPasswordSMS(findRider.phone_number, token.otp);

  return "OTP sent!";
};

const resetPassword = async ({ token, email, password }) => {
  // validates token
  let requestToken = await Token.findOne({ email, _id: token });
  // cancel operation if new password request doesn't have a token
  if (!requestToken) {
    return {
      err: "The OTP entered is incorrect, please try again.",
      status: 409,
    };
  }

  // update new password
  await Rider.findOneAndUpdate(
    { email },
    { $set: { password } },
    { omitUndefined: true, new: true, useFindAndModify: false }
  );

  await Token.findByIdAndDelete(token);

  // send confirmation email
  await sendPasswordChangeMail(email);

  const rider = await Rider.findOne({ email }).select("-password");
  return rider;
};

// Update Rider Details
const updateRider = async (updateParam, id) => {
  const {
    first_name, last_name, email, original_password, password, phone_number, profilePhoto, pushNotifications, smsNotifications, promotionalNotifications, pushDeviceToken, account_details, location, place_id, isBusy
  } = updateParam;
  // Build Rider Object
  const riderFields = {};

  // Check for fields
  if (location) {
    // add location to riderFields
    riderFields.location = location;
    // add points to riderFields location object
    riderFields.location.type = "Point";
  }

  if (place_id) riderFields.place_id = place_id;
  if (first_name) riderFields.first_name = first_name;
  if (last_name) riderFields.last_name = last_name;
  if (phone_number) riderFields.phone_number = phone_number;
  if (email) riderFields.email = email;
  if (profilePhoto) riderFields.profilePhoto = profilePhoto;
  if (pushNotifications === true || pushNotifications === false) riderFields.pushNotifications = pushNotifications;
  if (isBusy === true || isBusy === false) riderFields.isBusy = isBusy;

  if (smsNotifications === true || smsNotifications === false) riderFields.smsNotifications = smsNotifications;
  if (promotionalNotifications === true || promotionalNotifications === false) riderFields.promotionalNotifications = promotionalNotifications;
  if (pushDeviceToken) riderFields.pushDeviceToken = pushDeviceToken;
  if (account_details) riderFields.account_details = account_details;

  // Find rider from DB Collection
  let rider = await Rider.findById(id);
  if (!rider) {
    return {
      err: "Rider does not exists.",
      status: 404,
    };
  }

  if (password) {
    if (!original_password) return { err: "please enter old password", status: 400 };
    // Check if password matches with stored hash
    const isMatch = await bcrypt.compare(original_password, rider.password);
    if (!isMatch) return { err: "Old password does not match.", status: 400 };
    if (password === original_password) return { err: "Please try another password", status: 400 };
    const salt = await bcrypt.genSalt(10);

    // Replace password from rider object with encrypted one
    riderFields.password = await bcrypt.hash(password, salt);
  }

  // Updates the rider Object with the changed values
  const updatedRider = await Rider.findByIdAndUpdate(
    id,
    { $set: riderFields },
    { omitUndefined: true, new: true, useFindAndModify: false }
  ).select("-password");

  return updatedRider;
};

// Get Logged in User info
const loggedInRider = async (riderId) => {
  const rider1 = await Rider.findById(riderId).select("-password");
  if (!rider1) {
    return { err: "Rider does not exists.", status: 404 };
  }
  const pipeline = [
    {
      $unset: [
        "password",
        "deliveries",
        "deliveryReview",
        "orders"
      ],
    },
  ];

  const rider = await Rider.aggregate()
    .match({ _id: mongoose.Types.ObjectId(riderId) })
    .lookup({
      from: "orders",
      localField: "_id",
      foreignField: "rider",
      as: "orders",
    })
    .lookup({
      from: "deliveries",
      localField: "_id",
      foreignField: "rider",
      as: "deliveries",
    })
    .lookup({
      from: "reviews",
      localField: "_id",
      foreignField: "rider",
      as: "deliveryReview",
    })

  // adding metrics to the response
    .addFields({
      sumOfStars: { $sum: "$deliveryReview.star" },
      numOfReviews: { $size: "$deliveryReview" },
      averageRating: { $floor: { $avg: "$deliveryReview.star" } },
      deliveryCount: { $size: "$deliveries" },
      amountEarned: { $sum: "$deliveries.deliveryFee" },
      orderCount: { $size: "$orders" },
    })
    .addFields({
      averageRating: { $ifNull: ["$averageRating", 0] },
    })
    .append(pipeline);
  return rider[0];
};

const requestPayout = async (riderId) => {
  // get rider details
  const rider = await Rider.findById(riderId);

  // get ledger
  let ledger = await Ledger.findOne({});

  // set payout variable and check if there's sufficient funds
  let payout = rider.account_details.account_balance;
  if (payout < 1000) return { err: "Insufficent Funds. You need up to NGN1000 to request for payouts.", status: 400 };

  // check for rider and ledger pending request
  let oldRequest = await Transaction.findOne({
    type: "Debit",
    ref: riderId,
    status: "pending",
    to: "Rider",
  });

  if (oldRequest && rider.pendingWithdrawal === true) {
    await Transaction.findOneAndUpdate(
      {
        type: "Debit",
        ref: riderId,
        status: "pending",
        to: "Rider",

      },
      { $inc: { amount: Number(rider.account_details.account_balance) } }
    );

    // update rider account balance
    rider.account_details.total_debit += Number(rider.account_details.account_balance);
    rider.account_details.account_balance = Number(rider.account_details.total_credit - rider.account_details.total_debit);
    await rider.save();
    return "Withdrawal Request Sent.";
  }

  // create Debit transaction for rider
  let newTransaction = await createTransaction({
    amount: payout,
    type: "Debit",
    to: "Rider",
    receiver: riderId,
    ref: riderId
  });

  // check for error while creating new transaction
  if (!newTransaction) return { err: "Error requesting payout. Please try again", status: 400 };
  rider.pendingWithdrawal = true;
  await rider.save();

  await sendRiderPayoutRequestMail(rider.email, payout);
  return "Withdrawal Request Sent.";
};

const getPayoutHistory = async (riderId, urlParams) => {
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);
  const payoutHistory = await Transaction
    .find({
      receiver: riderId,
      type: "Debit",
      status: "completed"
    })
    .populate({
      path: "receiver",
      select: "account_details"
    })
    .sort("createdDate")
    .skip(skip)
    .limit(limit);
  return payoutHistory;
};

const updateRiderAccountDetails = async (riderId, accountDetails) => {
  // this service is used to update rider account details
  // successful request sends a update request to admin panel
  // get fields to update
  const {
    account_number,
    bank_code,
    full_name,
    bank_name
  } = accountDetails;

  // get rider details
  const rider = await Rider.findById(riderId);

  // update rider account details
  rider.account_details.account_number = account_number;
  rider.account_details.bank_code = bank_code;
  rider.account_details.full_name = full_name;
  rider.account_details.bank_name = bank_name;
  rider.account_details.isVerified = false;
  await rider.save();

  // return success message
  return "Account Details Updated.";
};
export {
  resetPassword,
  requestPasswordToken,
  verifyEmailAddress,
  loggedInRider,
  validateToken,
  getAllRiders,
  registerRider,
  loginRider,
  updateRider,
  requestPayout,
  getPayoutHistory,
  updateRiderAccountDetails
};
