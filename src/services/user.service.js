/* eslint-disable no-param-reassign */
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import User from "../models/user.model";
import Token from "../models/tokens.model";
import Basket from "../models/user-cart.model";

import sendEmail from "../utils/sendMail";
import getOTP from "../utils/sendOTP";

// Get all Users
const getUsers = async (urlParams) => {
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);

  delete urlParams.limit;
  delete urlParams.skip;
  delete urlParams.page;

  const users = await User.find(urlParams)
    .select("-password -orders -cart")
    .sort({ createdDate: -1 }) // -1 for descending sort
    .skip(skip)
    .limit(limit);

  return users;
};

// send otp to Verify user email before sign up
const verifyEmailAddress = async ({ email }) => {
  // check if user exists
  let user = await User.findOne({ email });
  if (user) {
    return { err: "This email is being used by another user.", status: 409 };
  }

  let token = await getOTP("user-signup", email);

  // send otp
  let email_subject = "OTP For Account Creation";
  let email_message = token.otp;
  await sendEmail(email, email_subject, email_message);

  return "OTP sent!";
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
  Token.findByIdAndDelete(userParam.token);

  // delete user on creation, uncomment to test registration without populating your database
  // await User.findByIdAndDelete(newUser._id);

  // Define payload for token
  const payload = {
    user: {
      id: user.id,
    },
  };

  // Generate and return token to server
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "36000 days",
  });

  // unset user pass****d
  user.password = undefined;

  // set user token
  // user.set("token", token, { strict: false });

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
      err: "The password entered in incorrect, please try again.",
      status: 401,
    };
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
    expiresIn: "36000 days",
  });

  if (!token) {
    return {
      err: "Session expired, please try logging in.",
      status: 401,
    };
  }

  const pipeline = [
    { $unset: ["userReviews", "userOrders", "cart", "password", "orders"] },
  ];

  const userDetails = await User.aggregate()
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
    })
    .append(pipeline);

  return { userDetails, token };
};

// Get Logged in User info
const getLoggedInUser = async (userParam) => {
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
};

// Update User Details
const updateUser = async (updateParam, id) => {
  const {
    first_name, last_name, address, password, email, phone_number
  } = updateParam;
  // Build User Object
  const userFields = {};

  // Check for fields
  if (first_name) userFields.first_name = first_name;
  if (last_name) userFields.last_name = last_name;
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

    user.cart = undefined;
    user.password = undefined;
    user.orders = undefined;

    return user;
  } catch (err) {
    throw err;
  }
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
  let email_subject = "forgot password";
  let email_message = token.otp;
  await sendEmail(email, email_subject, email_message);

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
  let requestToken = await Token.findById(token);

  // cancel operation if new password request doesn't have a token
  if (!requestToken) {
    return {
      err: "The OTP entered is incorrect, please try again.",
      status: 409,
    };
  }

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

  // send confirmation email
  let email_subject = "Password Reset Successful";
  let email_message = "Password has been reset successfully";
  await sendEmail(email, email_subject, email_message);

  return user;
};

export {
  getUsers,
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
};
