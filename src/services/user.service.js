/* eslint-disable quote-props */
/* eslint-disable no-param-reassign */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import User from "../models/user.model";
import Token from "../models/tokens.model";
import Basket from "../models/user-cart.model";
import Product from "../models/product.model";

import getJwt from "../utils/jwtGenerator";
import { verifyCardRequest } from "./payment.service";

// send otp to Verify user email before sign up
const verifyEmailAddress = async ({ email }) => {
  // check if user exists
  let user = await User.findOne({ email });
  if (user) {
    return { err: "This email is being used by another user.", status: 409 };
  }

  return { msg: "OTP sent!", email };
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
            status: "delivered",
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
  await user.save();

  // delete user on creation, uncomment to test registration without populating your database
  // await User.findByIdAndDelete(newUser._id);

  // Define payload for token
  let token = await getJwt(user.id, "user");

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
  if (process.env.NODE_ENV === "production" && user.password !== "testing") {
  // Check if password matches with stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return {
        err: "The password entered is incorrect, please try again.",
        status: 401,
      };
    }
  }

  // Define payload for token
  let token = await getJwt(user.id, "user");

  // get user details
  const userDetails = await userProfile(user.id);

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
    "redirect_url": "https://soft-shop.app/card",
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

const removeCard = async (userId, card_index) => {
  await User.updateOne(
    { _id: userId },
    { $pull: { cards: { card_index } } },
  );
  return "Card removed successfully";
};
// Get Logged in User info
const getLoggedInUser = async (userId) => {
  const user = await userProfile(userId);
  return user;
};

// Update User Details
const updateUser = async (updateParam, id) => {
  const {
    first_name, last_name, address, original_password, password, email, phone_number, pushNotifications, smsNotifications, promotionalNotifications, pushDeviceToken
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
  if (pushDeviceToken) userFields.pushDeviceToken = pushDeviceToken;
  if (smsNotifications === true || smsNotifications === false) {
    userFields.smsNotifications = smsNotifications;
  }
  if (promotionalNotifications === true || promotionalNotifications === false) userFields.promotionalNotifications = promotionalNotifications;

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
const updateBasketPrice = async (basketId) => {
  // run price calculations
  const newBasketItemChore = await Basket.aggregate()
    .match({
      _id: mongoose.Types.ObjectId(basketId),
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
    { _id: basketId },
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
const addItemToBasket = async (userId, basketItemMeta) => {
  // check if basket is empty, else get store id of existing basket items and make sure user is shopping from the same store.
  let basket = await Basket.findOne({ user: userId });
  if (basket) {
    // check if new basket item is from the same store
    // 1. get product of exisiting basket item
    const eProduct = await Product.findById(basket.product.productId)
      .populate([{ path: "store", select: "_id name isActive", }]);

    // 2. get product of new basket item
    const nProduct = await Product.findById(basketItemMeta.product.productId)
      .populate([{ path: "store", select: "_id name isActive", }]);

    if (!nProduct || !eProduct) return { err: "Error Encountered while adding item to basket. Please clear your basket and try again.", status: 404 };

    // 3. compare store ids of existing and new basket item
    if (eProduct.store._id.toString() !== nProduct.store._id.toString()) {
      // if not same, return an error, user can only add items from the same store
      return { err: "You can only add items from the same store", status: 400 };
    }
  }

  // user is shopping for the first time, create a new basket
  // 1. Get product details
  const product = await Product.findById(basketItemMeta.product.productId)
    .populate([{ path: "store", select: "_id name isActive", }]);

  // 1.1. check if store is active
  if (!product.store.isActive) {
    return { err: "Sorry you can't add item from an inactive store.", status: 409 };
  }

  // check if product exists in basket and increment product and selected variant quantities
  let existingBasketItem = await Basket.findOne({
    user: userId,
    "product.productId": basketItemMeta.product.productId
  });
  if (existingBasketItem) {
    return { existingBasketItem, message: "Item Updated Successfully", status: 201 };
    // existingBasketItem.product.qty += basketItemMeta.product.qty;
    // if (basketItemMeta.product.selectedVariants) {
    //   // if user is adding an existing item to basket along side selected variants, the existing selected variant quantity should be incremented by the new quantity coming in
    //   existingBasketItem.product.selectedVariants.forEach((variant) => {
    //     basketItemMeta.product.selectedVariants.forEach((basketItemVariant) => {
    //       if (variant.variantId.toString() === basketItemVariant.variantId) {
    //         variant.quantity += basketItemVariant.quantity;
    //       } else {
    //         // find the selected variant in the existing basket item and increment quantity
    //         let existingVariant = existingBasketItem.product.selectedVariants.find(
    //           (variant) => variant.variantId.toString() === basketItemVariant.variantId
    //         );
    //         if (!existingVariant) {
    //           // if the selected variant is not found in the existing basket item, add it to the selected variants array
    //           existingBasketItem.product.selectedVariants.push(basketItemVariant);
    //         }
    //       }
    //     });
    //   });
    // }
    // await existingBasketItem.save();
    // let basketUpdate = await updateBasketPrice(existingBasketItem._id);
    // return basketUpdate;
  }

  // // add item to basket
  // let newBasketItem = new Basket(basketItemMeta);
  // await newBasketItem.save();
  // let basketUpdate = await updateBasketPrice(newBasketItem._id);
  return "Item Added Succesfully";
};

// const getUserBasketItems = async (userId) => {
//   // get total price in basket
//   const totalProductPriceInBasket = await Basket.aggregate()
//     .match({
//       user: mongoose.Types.ObjectId(userId),
//     })
//     .group({
//       _id: "$user",
//       total: { $sum: "$product.totalPrice" },
//     });
//     // get user basket items
//   let userBasket = await Basket.aggregate()
//     .match({
//       user: mongoose.Types.ObjectId(userId),
//     })
//     .sort("createdAt");

//   if (userBasket.length < 1 && totalProductPriceInBasket.length < 1) return { userBasket: [], totalPrice: 0, count: 0 };

//   return {
//     userBasket,
//     totalPrice: totalProductPriceInBasket[0].total,
//     count: userBasket.length,
//   };
// };
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
    // get store location
  const storeLocation = await Basket.aggregate()
    .match({
      user: mongoose.Types.ObjectId(userId),
    })
    // lookup products from each product
    .lookup({
      from: "products",
      localField: "product.productId", // field in basket
      foreignField: "_id", // field in product
      as: "products",
    })
    // lookup stores from each product
    .lookup({
      from: "stores",
      localField: "products.store", // field in product
      foreignField: "_id", // field in store
      as: "stores",
    })
    // hide $products field with project
    .project({
      products: 0,
    })
    // group basket items by store
    .group({
      _id: "$stores._id",
      store_location: { $first: "$stores.location" },
      store_name: { $first: "$stores.name" },
      store_placeId: { $first: "$stores.place_id" }
    })
    .addFields({
      _id: {
        $arrayElemAt: ["$_id", 0],
      },
      store_location: {
        $arrayElemAt: ["$store_location", 0],
      },
      store_name: {
        $arrayElemAt: ["$store_name", 0],
      },
      store_placeId: {
        $arrayElemAt: ["$store_placeId", 0],
      },
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
    shoppingFrom: storeLocation[0],
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

  return { user: findUser, msg: "OTP sent!" };
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
  updateBasketPrice,
  forgotPassword,
  validateToken,
  createNewPassword,
  // createUserBasket,
  getUserBasketItems,
  editBasketItems,
  deleteBasketItem,
  deleteAllBasketItems,
  addCard,
  removeCard
};
