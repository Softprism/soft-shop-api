import bcrypt from "bcryptjs";
import capitalize from "capitalize";
import Rider from "../models/rider.model";
import Token from "../models/tokens.model";

import { sendSignUpOTPmail, sendPasswordChangeMail, sendForgotPasswordMail } from "../utils/sendMail";
import getOTP from "../utils/sendOTP";
import getJwt from "../utils/jwtGenerator";
import { sendForgotPasswordSMS } from "../utils/sendSMS";

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
  const {
    first_name, last_name, email, phone_number, password
  } = riderParam;

  // check if rider exists
  let rider = await Rider.findOne({ email });
  if (rider) {
    return { err: "Rider with this email already exists.", status: 409 };
  }

  let isVerified;
  // verify rider's signup token
  let signupToken = await Token.findOne({ _id: riderParam.token, email });
  if (signupToken) {
    isVerified = true;
  } else {
    return { err: "Email Authentication failed. Please try again.", status: 409 };
  }
  // Create rider Object
  const newRider = {
    first_name: capitalize(first_name),
    last_name: capitalize(last_name),
    email,
    phone_number,
    password,
    isVerified
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
    first_name, last_name, original_password, password, phone_number, profilePhoto
  } = updateParam;
  // Build Rider Object
  const riderFields = {};

  // Check for fields
  if (first_name) riderFields.first_name = first_name;
  if (last_name) riderFields.last_name = last_name;
  if (phone_number) riderFields.phone_number = phone_number;
  if (profilePhoto) riderFields.profilePhoto = profilePhoto;

  // Find rider from DB Collection
  let rider = await Rider.findById(id);

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
  if (!rider) {
    return {
      err: "Rider does not exists.",
      status: 404,
    };
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
        "rider.password",
      ],
    },
  ];

  const rider = await Rider.aggregate()
    .match({ _id: riderId })
    .lookup({
      from: "orders",
      localField: "_id",
      foreignField: "rider",
      as: "orders",
    })
    // .lookup({
    //   from: "deliveries",
    //   localField: "_id",
    //   foreignField: "rider",
    //   as: "deliveries",
    // })
    // .lookup({
    //   from: "reviews",
    //   localField: "orders._id",
    //   foreignField: "order",
    //   as: "orderReview",
    // })

  // adding metrics to the response
    // .addFields({
    //   sumOfStars: { $sum: "$orderReview.star" },
    //   numOfReviews: { $size: "$orderReview" },
    //   averageRating: { $floor: { $avg: "$orderReview.star" } },
    //   productCount: { $size: "$products" },
    //   orderCount: { $size: "$orders" },
    // })
    // .addFields({
    //   averageRating: { $ifNull: ["$averageRating", 0] },
    // })
    .append(pipeline);
  return rider;
};

export {
  resetPassword, requestPasswordToken, verifyEmailAddress, loggedInRider,
  validateToken, getAllRiders, registerRider, loginRider, updateRider
};
