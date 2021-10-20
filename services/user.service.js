import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Token from "../models/tokens.model.js";

import { sendEmail } from "../utils/sendMail.js";
import otpGenerator from "otp-generator";

// Get all Users
const getUsers = async (urlParams) => {
  try {
    let userWithCartItems = [];
    const limit = Number(urlParams.limit);
    const skip = Number(urlParams.skip);
    const cartLength = Number(urlParams.cart);
    delete urlParams.limit;
    delete urlParams.skip;
    delete urlParams.cart;
    const users = await User.find(urlParams)
      .select("-password")
      .sort({ createdDate: -1 }) // -1 for descending sort
      .populate({
        path: "cart.product_id",
        select: "product_name price availability",
      })
      .populate({ path: "orders", select: "orderId status" })
      .limit(limit)
      .skip(skip);

    if (cartLength >= 0) {
      users.forEach((user) => {
        if (user.cart.length == cartLength) {
          userWithCartItems.push(user);
        }
      });
      return userWithCartItems;
    } else {
      return users;
    }
    // return users;
  } catch (err) {
    return err;
  }
};

// Register User
const registerUser = async (userParam) => {
  const { first_name, last_name, email, phone_number, password } = userParam;

  try {
    let user = await User.findOne({ email });

    if (user) {
      // return res
      // 	.status(400)
      // 	.json({ msg: 'User with this email already exists' });
      throw { err: "User with this email already exists" };
    }

    // Create User Object
    user = new User({
      first_name,
      last_name,
      email,
      phone_number,
      password,
    });

    const salt = await bcrypt.genSalt(10);

    // Replace password from user object with encrypted one
    user.password = await bcrypt.hash(password, salt);

    // Save user to db
    await user.save();

    // Define payload for token
    const payload = {
      user: {
        id: user.id,
      },
    };

    // Generate and return token to server
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 36000,
    });

    // unset user pass****d
    user.password = undefined;

    // set user token
    user.set("token", token, { strict: false });

    return user;
  } catch (err) {
    return err;
  }
};

// Login User
const loginUser = async (loginParam) => {
  const { email, password } = loginParam;

  try {
    // Find user with email
    let user = await User.findOne({ email });

    if (!user) {
      throw { err: "User not found" };
    }

    // Check if password matches with stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw { err: "Wrong password" };
    }

    // unset user pass***d
    user.password = undefined;

    // Define payload for token
    const payload = {
      user: {
        id: user.id,
      },
    };

    // Generate and return token to server
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 36000,
    });

    if (!token) {
      throw { err: "Missing Token" };
    }

    const pipeline = [
      { $unset: ["userReviews", "userOrders", "cart", "password", "orders"] },
    ];

    const userDetails = User.aggregate()
      .match({
        _id: mongoose.Types.ObjectId(user._id),
      })
      .lookup({
        from: "reviews",
        localField: "_id",
        foreignField: "user",
        as: "userReviews",
      })
      .lookup({
        from: "orders",
        localField: "_id",
        foreignField: "user",
        as: "userOrders",
      })
      .addFields({
        totalReviews: { $size: "$userReviews" },
        totalOrders: { $size: "$userOrders" },
        token: token,
      })
      .append(pipeline);

    return userDetails;
  } catch (err) {
    return err;
  }
};

// Get Logged in User info
const getLoggedInUser = async (userParam) => {
  try {
    const pipeline = [
      { $unset: ["userReviews", "userOrders", "cart", "password", "orders"] },
    ];
    const user = User.aggregate()
      .match({
        _id: mongoose.Types.ObjectId(userParam),
      })
      .lookup({
        from: "reviews",
        localField: "_id",
        foreignField: "user",
        as: "userReviews",
      })
      .lookup({
        from: "orders",
        localField: "_id",
        foreignField: "user",
        as: "userOrders",
      })
      .addFields({
        totalReviews: { $size: "$userReviews" },
        totalOrders: { $size: "$userOrders" },
      })
      .append(pipeline);

    return user;
  } catch (err) {
    return err;
  }
};

// Update User Details
const updateUser = async (updateParam, id) => {
  const { address, password, email, phone_number } = updateParam;
  // Build User Object
  const userFields = {};

  // Check for fields
  if (address) userFields.address = address;
  if (email) userFields.email = email;
  if (phone_number) userFields.phone_number = phone_number;

  if (password) {
    const salt = await bcrypt.genSalt(10);

    // Replace password from user object with encrypted one
    userFields.password = await bcrypt.hash(password, salt);
  }

  try {
    // Find user from DB Collection
    let user = await User.findById(id);

    if (!user) throw { err: "User not found" };

    // Updates the user Object with the changed values
    user = await User.findByIdAndUpdate(
      id,
      { $set: userFields },
      { omitUndefined: true, new: true, useFindAndModify: false }
    );

    user.cart = undefined;
    user.password = undefined;
    user.orders = undefined;

    return user;
  } catch (err) {
    return err;
  }
};

const addItemToCart = async (userID, product) => {
  try {
    const productFinder = await Product.findById(product.product_id);

    if (!productFinder) throw { err: "can't find this product" };

    let user = await User.findByIdAndUpdate(
      userID,
      { $push: { cart: product } },
      { omitUndefined: true, new: true, useFindAndModify: false }
    ).populate({
      path: "cart.product_id",
      select: "product_name price availability",
    });

    return user.cart;
  } catch (error) {
    return { err: "error adding product to cart" };
  }
};

const forgotPassword = async ({ email }) => {
  try {
    // verify if user exists, throws error if not
    let findUser = await User.findOne({ email });
    if (!findUser) throw { err: "email is not registered" };

    //Check if request has been made before, can be used for resend token
    let oldTokenRequest = await Token.findOne({
      email,
      type: "forgot-password",
    });

    if (oldTokenRequest) {
      // resend old token
      let email_subject = "Password Reset Request";
      await sendEmail(email, email_subject, oldTokenRequest.token);

      return 0;
    }

    // generate OTP
    let otp = otpGenerator.generate(4, {
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    // add token to DB
    let tokenData = {
      email,
      otp,
      type: "forgot-password",
    };

    await new Token(tokenData).save();

    // send otp
    let email_subject = "Password Reset Request";
    let email_message = otp;
    await sendEmail(email, email_subject, email_message);

    return 1;
  } catch (err) {
    return err;
  }
};

const validateToken = async ({ type, otp, email }) => {
  try {
    // find token
    let userToken = await Token.findOne({
      otp,
      email,
      type,
    });

    if (!userToken) throw { err: "invalid token" };

    return userToken;
  } catch (err) {
    console.log(err);
    return err;
  }
};

const createNewPassword = async ({ token, email, password }) => {
  try {
    // validates token
    let requestToken = await Token.findById(token);

    // cancel operation if new password request doesn't have a token
    if (!requestToken) throw { err: "invalid token" };

    // encrypting password
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    // update new password
    let user = await User.findOneAndUpdate(
      { email },
      { $set: { password } },
      { omitUndefined: true, new: true, useFindAndModify: false }
    );

    await Token.findByIdAndDelete(token);

    // Unsetting unneeded fields
    user.cart = undefined;
    user.password = undefined;
    user.orders = undefined;

    //send confirmation email
    let email_subject = "Password Reset Successful";
    let email_message = "Password has been reset successfully";
    await sendEmail(email, email_subject, email_message);

    return user;
  } catch (err) {
    return err;
  }
};

export {
  getUsers,
  registerUser,
  loginUser,
  getLoggedInUser,
  updateUser,
  addItemToCart,
  forgotPassword,
  validateToken,
  createNewPassword,
};
