/* eslint-disable quote-props */
/* eslint-disable no-param-reassign */
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import User from "../models/user.model";
import Token from "../models/tokens.model";
import Basket from "../models/user-cart.model";
import Product from "../models/product.model";

import { sendSignUpOTPmail, sendPasswordChangeMail, sendForgotPasswordMail } from "../utils/sendMail";
import getOTP from "../utils/sendOTP";
import getJwt from "../utils/jwtGenerator";
import { verifyCardRequest } from "./payment.service";
import { sendForgotPasswordSMS } from "../utils/sendSMS";
import { createLog } from "./logs.service";

// send otp to Verify user email before sign up
const verifyEmailAddress = async ({ email }) => {
  // check if user exists
  let user = await User.findOne({ email });
  if (user) {
    return { err: "This email is being used by another user.", status: 409 };
  }

  let token = await getOTP("user-signup", email);

  return { msg: "OTP sent!", email, otp: token.otp };
};

const userProfile = async (userId) => {
  const pipeline = [
    { $unset: ["userReviews", "userOrders", "cart", "password", "orders"] },
  ];

  const userDetails = await User.aggregate()
    .match({
      _id: mongoose.Types.ObjectId(userId),
    })
    .lookup({
      from: "reviews",
      localField: "_id",
      foreignField: "user",
      as: "userReviews",
    })
    .lookup({
      from: "orders",
      let: { userId: "$_id" },
      pipeline: [
        {
          $match: {
            status: "completed",
            $expr: {
              $eq: ["$$userId", "$user"]
            }
          }
        }
      ],
      as: "userOrders",
    })
    .addFields({
      totalReviews: { $size: "$userReviews" },
      totalOrders: { $size: "$userOrders" },
    })
    .append(pipeline);

  return userDetails;
};

// Register User
const registerUser = async (userParam) => {
  const {
    first_name, last_name, email, phone_number, password
  } = userParam;

  // check if user exists
  let user = await User.findOne({ email });
  if (user) {
    return { err: "User with this email already exists.", status: 409 };
  }

  // Create User Object
  user = new User({
    first_name,
    last_name,
    email,
    phone_number,
    password,
  });

  // verify user's signup token
  let signupToken = await Token.findOne({ _id: userParam.token, email: user.email });
  if (signupToken) {
    user.isVerified = true;
  } else {
    return { err: "Email Authentication failed. Please try again.", status: 409 };
  }

  // Save user to db
  let newUser = await user.save();

  // delete sign up token
  // await Token.findByIdAndDelete(userParam.token);

  // delete user on creation, uncomment to test registration without populating your database
  // await User.findByIdAndDelete(newUser._id);

  // Define payload for token
  let token = await getJwt(user.id, "user");

  // create log
  await createLog("user signup", "user", `A new user - ${user.first_name} ${user.last_name} with email - ${user.email} just signed on softshop`);

  // get user details
  user = await userProfile(user.id);

  return { user, token };
};

// Login User
const loginUser = async (loginParam) => {
  const { email, password } = loginParam;

  // Find user with email
  let user = await User.findOne({ email });

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
      err: "The password entered is incorrect, please try again.",
      status: 401,
    };
  }

  // Define payload for token
  let token = await getJwt(user.id, "user");

  // get user details
  const userDetails = await userProfile(user.id);

  // create log
  await createLog("user Login", "user", `A new login from ${user.first_name} ${user.last_name} with email - ${user.email}`);

  return { userDetails, token };
};

const addCard = async (userId) => {
  const user = await User.findById(userId);
  // generates random tx_ref ;
  let tx_ref = () => {
    let s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
      // return id of format 'soft - aaaaa'
    return `card-${s4()}`;
  };
  const payload = {
    "tx_ref": tx_ref(),
    "amount": "100",
    "currency": "NGN",
    "redirect_url": "https://mobile.soft-shop.app/card",
    "payment_options": "card",
    "meta": {
      "user_id": userId,
    },
    "customer": {
      "user_id": userId,
      "email": user.email,
      "phone_number": user.phone_number,
      "address": user.address,
      "name": `${user.first_name} ${user.last_name}`
    },
    "customizations": {
      "title": "Softshop Card Validation",
      "description": "This is just to validate card and add it to your profile. You'll be charged 100 NGN one time payment for this.",
      "logo": "https://softprism.org/intranet/files/general/team_members/3/_file61a52392d6e32-Softprism-Logo.jpg"
    }
  };

  let verifyCardReq = await verifyCardRequest(payload);
  return verifyCardReq;
};
// Get Logged in User info
const getLoggedInUser = async (userId) => {
  const user = await userProfile(userId);
  return user;
};

// Update User Details
const updateUser = async (updateParam, id) => {
  const {
    first_name, last_name, address, original_password, password, email, phone_number, pushNotifications, smsNotifications, promotionalNotifications
  } = updateParam;
  // Build User Object
  const userFields = {};

  // Check for fields
  if (first_name) userFields.first_name = first_name;
  if (last_name) userFields.last_name = last_name;
  if (address) {
    userFields.address = address;
  }
  if (email) userFields.email = email;
  if (phone_number) userFields.phone_number = phone_number;
  if (pushNotifications) userFields.pushNotifications = pushNotifications;
  if (smsNotifications) userFields.smsNotifications = smsNotifications;
  if (promotionalNotifications) userFields.promotionalNotifications = promotionalNotifications;

  // Find user from DB Collection
  let user = await User.findById(id);

  if (password) {
    if (!original_password) return { err: "please enter old password", status: 400 };
    if (password === original_password) return { err: "Please try another password", status: 400 };
    const salt = await bcrypt.genSalt(10);

    // Replace password from user object with encrypted one
    userFields.password = await bcrypt.hash(password, salt);

    // Check if password matches with stored hash
    const isMatch = await bcrypt.compare(original_password, user.password);
    if (!isMatch) return { err: "Old password does not match.", status: 400 };
  }
  if (!user) {
    return {
      err: "User does not exists.",
      status: 404,
    };
  }

  // Updates the user Object with the changed values
  user = await User.findByIdAndUpdate(
    id,
    { $set: userFields },
    { omitUndefined: true, new: true, useFindAndModify: false }
  );

  // send mail to notify user of password change
  if (user.password && password) {
    sendPasswordChangeMail(user[0].email);
    // create log
    await createLog("user update prfile", "user", `A user - ${user.first_name} ${user.last_name} with email - ${user.email} just updated their profile`);
  }
  user = await userProfile(id);

  return user;
};
// const createUserBasket = async (userId, basketMeta) => { DEPRECATED
//   // baskets should be initialized for users
//   // basket is created per store

//   // add user ID to basketMeta
//   basketMeta.user = userId;
//   try {
//     // first verify if user already has a basket for the store
//     let existingBasket = await Basket.findOne(basketMeta);
//     if (existingBasket) throw { err: "user has a basket for this store!" };

//     // create basket if none exists
//     let newBasket = new Basket(basketMeta);
//     newBasket.save();
//     return newBasket;
//   } catch (err) {
//     return err;
//   }
// };

const addItemToBasket = async (userId, basketItemMeta) => {
  // validate if store is active
  const product = await Product.findById(basketItemMeta.product.productId)
    .populate([{ path: "store", select: "_id name isActive", }]);
  if (!product) {
    return { err: "Product does not exists.", status: 404 };
  }
  const { store } = product;
  if (!store.isActive) {
    return { err: "Sorry you can't add item from an inactive store.", status: 409 };
  }
  // add user ID to basketMeta
  basketItemMeta.user = userId;

  // add item to basket
  let newBasketItem = new Basket(basketItemMeta);
  await newBasketItem.save();

  // run price calculations
  const newBasketItemChore = await Basket.aggregate()
    .match({
      _id: mongoose.Types.ObjectId(newBasketItem._id),
    })
    .addFields({
      "product.selectedVariants": {
        $map: {
          input: "$product.selectedVariants",
          as: "variant",
          in: {
            $mergeObjects: [
              "$$variant",
              {
                totalPrice: {
                  $multiply: ["$$variant.itemPrice", "$$variant.quantity"],
                },
              },
            ],
          },
        },
      },
      totalProductPrice: { $multiply: ["$product.price", "$product.qty"] },
    })
    .addFields({
      totalVariantPrice: { $sum: "$product.selectedVariants.totalPrice" },
    })
    .addFields({
      "product.totalPrice": {
        $add: ["$totalProductPrice", "$totalVariantPrice"],
      },
    });

  // update new basket details with calculated prices
  let basketUpdate = await Basket.findOneAndUpdate(
    { _id: newBasketItem._id },
    {
      $set: {
        "product.selectedVariants":
            newBasketItemChore[0].product.selectedVariants,
        "product.totalPrice": newBasketItemChore[0].product.totalPrice,
      },
    },
    { omitUndefined: true, new: true, useFindAndModify: false }
  );

  // create log
  await createLog("new basket item", "user", `A user with id ${userId} just  added an item to their basket.`);
  return basketUpdate;
};

const getUserBasketItems = async (userId) => {
  // get total price in basket
  const totalProductPriceInBasket = await Basket.aggregate()
    .match({
      user: mongoose.Types.ObjectId(userId),
    })
    .group({
      _id: "$user",
      total: { $sum: "$product.totalPrice" },
    });
    // get user basket items
  let userBasket = await Basket.aggregate()
    .match({
      user: mongoose.Types.ObjectId(userId),
    })
    .sort("createdAt");

  if (userBasket.length < 1 && totalProductPriceInBasket.length < 1) return { userBasket: [], totalPrice: 0, count: 0 };

  return {
    userBasket,
    totalPrice: totalProductPriceInBasket[0].total,
    count: userBasket.length,
  };
};

const editBasketItems = async (userId, basketMeta) => {
  // check if basket exists
  let userBasket = await Basket.findById(basketMeta.basketId);
  if (!userBasket) {
    return {
      err: "Basket not found.",
      status: 404,
    };
  }

  // update basket with new data
  await Basket.findByIdAndUpdate(
    basketMeta.basketId,
    { $set: basketMeta },
    { omitUndefined: true, new: true, useFindAndModify: false }
  );

  // return user basket items
  userBasket = await getUserBasketItems(userId);
  return userBasket;
};

const deleteBasketItem = async (userId, { basketId }) => {
  // check if basket exists
  let userBasket = await Basket.findById(basketId);
  if (!userBasket) {
    return {
      err: "Basket not found.",
      status: 404,
    };
  }

  // update basket with new data
  await Basket.findByIdAndDelete(basketId);

  // return user basket items
  userBasket = await getUserBasketItems(userId);

  // create log
  await createLog("user remove basket item", "user", `A user  with id - ${userId} just removed an item from their basket`);
  return userBasket;
};

const deleteAllBasketItems = async (userId) => {
  // check if basket exists
  let userBasket = await Basket.find({ user: userId });
  if (!userBasket) {
    return {
      err: "Basket not found.",
      status: 404,
    };
  }

  // update basket with new data
  await Basket.deleteMany({ user: userId });

  // return user basket items
  userBasket = await getUserBasketItems(userId);
  return userBasket;
};

const forgotPassword = async ({ email }) => {
  // verify if user exists, throws error if not
  let findUser = await User.findOne({ email });
  if (!findUser) {
    return {
      err: "User does not exists.",
      status: 404,
    };
  }

  let token = await getOTP("user-forgot-password", email);

  // send otp
  await sendForgotPasswordMail(email, token.otp);
  await sendForgotPasswordSMS(findUser.phone_number, token.otp);

  return "OTP sent!";
};

const validateToken = async ({ type, otp, email }) => {
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
};

const createNewPassword = async ({ token, email, password }) => {
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
  let user = await User.findOneAndUpdate(
    { email },
    { $set: { password } },
    { omitUndefined: true, new: true, useFindAndModify: false }
  );

  await Token.findByIdAndDelete(token);

  // send confirmation email
  await sendPasswordChangeMail(email);

  user = await userProfile(user.id);
  return user;
};

export {
  verifyEmailAddress,
  registerUser,
  loginUser,
  getLoggedInUser,
  updateUser,
  addItemToBasket,
  forgotPassword,
  validateToken,
  createNewPassword,
  // createUserBasket,
  getUserBasketItems,
  editBasketItems,
  deleteBasketItem,
  deleteAllBasketItems,
  addCard
};
