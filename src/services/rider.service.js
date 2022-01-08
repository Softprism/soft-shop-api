import bcrypt from "bcryptjs";
import capitalize from "capitalize";
import Rider from "../models/rider.model";
import Token from "../models/tokens.model";

import sendEmail from "../utils/sendMail";
import getOTP from "../utils/sendOTP";
import getJwt from "../utils/jwtGenerator";
/**
 * @class User
 * @description User services
 * @exports User
 */
export default class RiderServices {
  /**
   * @returns {object} An instance of the Riders class
   */
  static async getAllRiders(urlParams) {
    const limit = Number(urlParams.limit);
    const skip = Number(urlParams.skip);

    delete urlParams.limit;
    delete urlParams.skip;
    delete urlParams.page;

    const riders = await Rider.find(urlParams)
      .select("-password -orders")
      .sort({ createdDate: -1 }) // -1 for descending sort
      .skip(skip)
      .limit(limit);

    return riders;
  }

  // send otp to Verify user email before sign up
  static async verifyEmailAddress({ email }) {
  // check if user exists
    let rider = await Rider.findOne({ email });
    if (rider) {
      return { err: "This email is being used by another rider.", status: 409 };
    }

    let token = await getOTP("rider-signup", email);

    // send otp
    let email_subject = "OTP For Account Creation";
    let email_message = token.otp;
    await sendEmail(email, email_subject, email_message);

    return "OTP sent!";
  }

  static async registerRider(userParam) {
    const {
      first_name, last_name, email, phone_number, password
    } = userParam;

    // check if rider exists
    let rider = await Rider.findOne({ email });
    if (rider) {
      return { err: "Rider with this email already exists.", status: 409 };
    }

    let isVerified;
    // verify rider's signup token
    let signupToken = await Token.findOne({ _id: userParam.token, email });
    if (signupToken) {
      isVerified = true;
    } else {
      return { err: "Email Authentication failed. Please try again.", status: 409 };
    }
    // Create User Object
    const newRider = {
      first_name: capitalize(first_name),
      last_name: capitalize(last_name),
      email,
      phone_number,
      password,
      isVerified
    };
    // Save user to db
    const createdRider = await Rider.create(newRider);

    // delete sign up token
    await Token.findByIdAndDelete(userParam.token);

    let riderToken = await getJwt(createdRider._id, "rider");

    return { createdRider, riderToken };
  }

  // Login User
  static async loginRider(loginParam) {
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
  }

  static async validateToken({ type, otp, email }) {
  // find token
    let userToken = await Token.findOne({
      otp,
      email,
      type,
    });

    if (!userToken) {
      return {
        err: "The OTP entered is incorrect, please try again.",
        status: 406,
      };
    }

    return userToken;
  }

  static async requestPasswordToken({ email }) {
  // verify if user exists, throws error if not
    let findUser = await Rider.findOne({ email });
    if (!findUser) {
      return {
        err: "User does not exists.",
        status: 404,
      };
    }

    let token = await getOTP("user-forgot-password", email);

    // send otp
    let email_subject = "forgot password";
    let email_message = token.otp;
    await sendEmail(email, email_subject, email_message);

    return "OTP sent!";
  }

  static async resetPassword({ token, email, password }) {
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
    let email_subject = "Password Reset Successful";
    let email_message = "Password has been reset successfully";
    await sendEmail(email, email_subject, email_message);

    const rider = await Rider.findOne({ email }).select("-password");
    return rider;
  }
}
