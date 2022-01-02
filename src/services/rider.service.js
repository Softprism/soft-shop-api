import bcrypt from "bcryptjs";
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
    let user = await Rider.findOne({ email });
    if (user) {
      return { err: "This email is being used by another user.", status: 409 };
    }

    let token = await getOTP("user-signup", email);

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

    // check if user exists
    let user = await Rider.findOne({ email });
    if (user) {
      return { err: "User with this email already exists.", status: 409 };
    }

    let isVerified;
    // verify user's signup token
    let signupToken = await Token.findOne({ _id: userParam.token, email });
    if (signupToken) {
      isVerified = true;
    } else {
      return { err: "Email Authentication failed. Please try again.", status: 409 };
    }
    // Create User Object
    const User = {
      first_name,
      last_name,
      email,
      phone_number,
      password,
      isVerified
    };
    // Save user to db
    const newUser = await Rider.create(User);

    // delete sign up token
    await Token.findByIdAndDelete(userParam.token);

    let token = await getJwt(newUser.id, "user");

    return { newUser, token };
  }

  // Login User
  static async loginRider(loginParam) {
    const { email, password } = loginParam;

    // Find user with email
    let user = await Rider.findOne({
      $or: [{ email }, { phone: email }],
    });
    if (!user) {
      return {
        err: "The email entered is not registered, please try again.",
        status: 401,
      };
    }

    // Check if password matches with stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return {
        err: "The password entered in incorrect, please try again.",
        status: 401,
      };
    }
    // Define payload for token
    let token = await getJwt(user._id, "user");

    return { user, token };
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
}
