/* eslint-disable no-await-in-loop */
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import Store from "../models/store.model";
import Order from "../models/order.model";
import Product from "../models/product.model";
import StoreUpdate from "../models/store-update.model";

import getJwt from "../utils/jwtGenerator";
import { createTransaction } from "./transaction.service";
import Transaction from "../models/transaction.model";
import Category from "../models/category.model";

import getDistance from "../utils/get-distance";

const getStores = async (urlParams) => {
  // declare fields to exclude from response
  const pipeline = [
    {
      $unset: [
        "products",
        "orderReview",
        "password",
        "email",
        "phone_number",
        "labels",
        "orders",
      ],
    },
  ];

  let storesWithRating = []; // container to hold stores based on rating search filter

  // setting pagination params
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);
  let { sort } = urlParams;

  // check for sort type
  if (urlParams.sortType === "desc") sort = `-${sort}`;
  if (!urlParams.sort) sort = "createdAt";

  // check for user place_id
  if (!urlParams.place_id) return { err: "Please enter user place_id.", status: 400 };

  // validating rating param
  const rating = Number(urlParams.rating);

  // initializing matchParam
  const matchParam = {};

  if (urlParams.isOpen === "true" && urlParams.currentTime) {
    matchParam.closingTime = { $gte: urlParams.currentTime };
    matchParam.isActive = true;
  } // checking opened stores

  if (urlParams.isOpen === "false" && urlParams.currentTime) {
    matchParam.closingTime = { $lte: urlParams.currentTime };
    matchParam.isActive = false;
  } // checking closed stores

  if (urlParams.name) {
    matchParam.name = new RegExp(urlParams.name, "i");
  }

  if (urlParams.category) {
    urlParams.category = mongoose.Types.ObjectId(urlParams.category);
    matchParam.category = urlParams.category;
  }
  let long;
  let lat;
  let radian;

  if (urlParams.long && urlParams.lat && urlParams.radius) {
    long = parseFloat(urlParams.long);
    lat = parseFloat(urlParams.lat);
    radian = parseFloat(urlParams.radius / 3963.2);
  }

  // cleaning up the urlParams
  delete urlParams.limit;
  delete urlParams.skip;
  delete urlParams.rating;
  delete urlParams.long;
  delete urlParams.lat;

  // aggregating stores
  const stores = await Store.aggregate()
  // matching store with geolocation
    .match({
      location: {
        $geoWithin: {
          $centerSphere: [[long, lat], radian],
        },
      },
    })
  // matching stores with matchParam
    .match(matchParam)
  // looking up the product collection for each stores
    .lookup({
      from: "products",
      localField: "_id",
      foreignField: "store",
      as: "products",
    })
  // looking up the order collection for each stores
    .lookup({
      from: "orders",
      let: { storeId: "$_id" },
      pipeline: [
        {
          $match: {
            status: { $in: ["sent", "ready", "accepted", "enroute", "delivered", "completed"] },
            $expr: {
              $eq: ["$$storeId", "$store"]
            }
          }
        }
      ],
      as: "orders",
    })
  // looking up each product on the review collection
    .lookup({
      from: "reviews",
      localField: "orders._id",
      foreignField: "order",
      as: "orderReview",
    })
  // adding metrics to the response
    .addFields({
      sumOfStars: { $sum: "$orderReview.star" },
      numOfReviews: { $size: "$orderReview" },
      averageRating: { $floor: { $avg: "$orderReview.star" } },
      productCount: { $size: "$products" },
      orderCount: { $size: "$orders" },
    })
    .addFields({
      averageRating: { $ifNull: ["$averageRating", 0] },
    })
  // appending excludes
    .append(pipeline)
  // sorting and pagination
    .sort(sort)
    .skip(skip)
    .limit(limit);

  if (rating >= 0) {
    (await stores).forEach((store) => {
      if (store.averageRating === rating) {
        storesWithRating.push(store);
      }
    });
    return storesWithRating;
  }
  for (const store of stores) {
    store.deliveryTime = await getDistance(store.place_id, urlParams.place_id);
    if (store.deliveryTime.err) store.deliveryTime = "Can't resolve";
  }
  return stores;
};

const getStoresNoGeo = async (urlParams) => {
  // declare fields to exclude from response
  const pipeline = [
    {
      $unset: [
        "products",
        "orderReview",
        "password",
        "email",
        "phone_number",
        "labels",
        "orders",
      ],
    },
  ];

  let storesWithRating = []; // container to hold stores based on rating search filter

  // setting pagination params
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);
  let { sort } = urlParams;

  // check for sort type
  if (urlParams.sortType === "desc") sort = `-${sort}`;
  if (!urlParams.sort) sort = "createdAt";

  // check for user place_id
  if (!urlParams.place_id) return { err: "Please enter user place_id.", status: 400 };

  // validating rating param
  const rating = Number(urlParams.rating);

  // initializing matchParam
  const matchParam = {};

  if (urlParams.isOpen === "true" && urlParams.currentTime) {
    matchParam.closingTime = { $gte: urlParams.currentTime };
    matchParam.isActive = true;
  } // checking opened stores

  if (urlParams.isOpen === "false" && urlParams.currentTime) {
    matchParam.closingTime = { $lte: urlParams.currentTime };
    matchParam.isActive = false;
  } // checking closed stores

  if (urlParams.name) {
    matchParam.name = new RegExp(urlParams.name, "i");
  }

  if (urlParams.category) {
    urlParams.category = mongoose.Types.ObjectId(urlParams.category);
    matchParam.category = urlParams.category;
  }

  // cleaning up the urlParams
  delete urlParams.limit;
  delete urlParams.skip;
  delete urlParams.rating;
  delete urlParams.long;
  delete urlParams.lat;

  // aggregating stores
  const stores = await Store.aggregate()
  // matching stores with matchParam
    .match(matchParam)
  // looking up the product collection for each stores
    .lookup({
      from: "products",
      localField: "_id",
      foreignField: "store",
      as: "products",
    })
  // looking up the order collection for each stores
    .lookup({
      from: "orders",
      let: { storeId: "$_id" },
      pipeline: [
        {
          $match: {
            status: { $in: ["sent", "ready", "accepted", "enroute", "delivered", "completed"] },
            $expr: {
              $eq: ["$$storeId", "$store"]
            }
          }
        }
      ],
      as: "orders",
    })
  // looking up each product on the review collection
    .lookup({
      from: "reviews",
      localField: "orders._id",
      foreignField: "order",
      as: "orderReview",
    })
  // adding metrics to the response
    .addFields({
      sumOfStars: { $sum: "$orderReview.star" },
      numOfReviews: { $size: "$orderReview" },
      averageRating: { $floor: { $avg: "$orderReview.star" } },
      productCount: { $size: "$products" },
      orderCount: { $size: "$orders" },
    })
    .addFields({
      averageRating: { $ifNull: ["$averageRating", 0] },
    })
  // appending excludes
    .append(pipeline)
  // sorting and pagination
    .sort(sort)
    .skip(skip)
    .limit(limit);

  if (rating >= 0) {
    stores.forEach((store) => {
      if (store.averageRating === rating) {
        storesWithRating.push(store);
      }
    });
    return storesWithRating;
  }

  for (const store of stores) {
    store.deliveryTime = await getDistance(store.place_id, urlParams.place_id);
    if (store.deliveryTime.err) store.deliveryTime = "Can't resolve";
  }
  return stores;
};

const getStore = async (urlParams, storeId) => {
  // declare fields to exclude from response
  const pipeline = [
    {
      $unset: [
        "products",
        "productReview",
        "password",
        "orders",
        "orderReview",
      ],
    },
  ];

  // check for user place_id
  // setting a default value so that getLoggedIn store can run
  if (!urlParams.place_id) urlParams.place_id = "ChIJ73FBMSH3OxARDMvAq2uA6SM"; // Victoria garden City, Lekki, Nigeria

  // aggregating stores with active products
  let store = await Store.aggregate()
  // matching with requested store
    .match({
      _id: mongoose.Types.ObjectId(storeId),
    })
  // looking up the store in the product collection
    .lookup({
      from: "products",
      localField: "_id",
      foreignField: "store",
      as: "products",
    })
  // returning only active products
    .match({
      "products.status": "active",
    })
  // looking up the order collection for each stores
    .lookup({
      from: "orders",
      let: { storeId: "$_id" },
      pipeline: [
        {
          $match: {
            status: { $in: ["sent", "ready", "accepted", "enroute", "delivered", "completed"] },
            $expr: {
              $eq: ["$$storeId", "$store"]
            }
          }
        }
      ],
      as: "orders",
    })
  // looking up each product on the review collection
    .lookup({
      from: "reviews",
      localField: "orders._id",
      foreignField: "order",
      as: "orderReview",
    })
  // adding metrics to the response
    .addFields({
      sumOfStars: { $sum: "$orderReview.star" },
      numOfReviews: { $size: "$orderReview" },
      averageRating: { $floor: { $avg: "$orderReview.star" } },
      productCount: { $size: "$products" },
      orderCount: { $size: "$orders" },
    })
    .addFields({
      averageRating: { $ifNull: ["$averageRating", 0] },
    })
    .addFields({
      storeMoney: { $sum: "$orders.subtotal" },
    })
  // appending excludes
    .append(pipeline);

  // aggregating stores without active products
  if (store.length < 1) {
    store = await Store.aggregate()
    // matching with requested store
      .match({
        _id: mongoose.Types.ObjectId(storeId),
      })
    // looking up the order collection for each stores
      .lookup({
        from: "orders",
        let: { storeId: "$_id" },
        pipeline: [
          {
            $match: {
              status: { $in: ["sent", "ready", "accepted", "enroute", "delivered", "completed"] },
              $expr: {
                $eq: ["$$storeId", "$store"]
              }
            }
          }
        ],
        as: "orders",
      })
    // looking up each product on the review collection
      .lookup({
        from: "reviews",
        localField: "orders._id",
        foreignField: "order",
        as: "orderReview",
      })
    // adding metrics to the response
      .addFields({
        sumOfStars: { $sum: "$orderReview.star" },
        numOfReviews: { $size: "$orderReview" },
        averageRating: { $floor: { $avg: "$orderReview.star" } },
        orderCount: { $size: "$orders" },
      })
      .addFields({
        averageRating: { $ifNull: ["$averageRating", 0] },
      })
      .addFields({
        storeMoney: { $sum: "$orders.subtotal" },
      })
      .append(pipeline);
  }
  for (const aStore of store) {
    aStore.deliveryTime = await getDistance(aStore.place_id, urlParams.place_id);
    if (aStore.deliveryTime.err) aStore.deliveryTime = "Can't resolve";
  }
  return store[0];
};

const createStore = async (StoreParam) => {
  const {
    name,
    address,
    place_id,
    email,
    phone_number,
    password,
    openingTime,
    closingTime,
    location,
    category
  } = StoreParam;
  let store = await Store.findOne({ email });

  if (store) {
    return { err: "A store with this email already exists.", status: 400 };
  }

  // check store phone number for duplicate entry
  let storePhoneChecker = await Store.findOne({ phone_number });

  if (storePhoneChecker) {
    return { err: "A store with this phone number already exists.", status: 400 };
  }

  // check if category exists
  let categoryChecker = await Category.findById(category);

  if (!categoryChecker) {
    return { err: "This category does not exist.", status: 400 };
  }
  const newStore = new Store(StoreParam);
  await newStore.save();

  let token = await getJwt(newStore.id, "store");

  return token;
};

const loginStore = async (StoreParam) => {
  const { email, password } = StoreParam;

  let store = await Store.findOne({ email }).select("password isVerified resetPassword pendingUpdates name pendingWithdrawal");

  if (!store) {
    return { err: "Invalid email. Please try again.", status: 400 };
  }

  if (process.env.NODE_ENV === "production" && store.isVerified === false) {
    return { err: "Please complete your verification.", status: 401 };
  }
  // Check if password matches with stored hash
  const isMatch = await bcrypt.compare(password, store.password);

  if (!isMatch) {
    return { err: "The password entered is invalid, please try again.", status: 401 };
  }

  let token = await getJwt(store.id, "store");

  // remove store password
  store.password = undefined;
  return { token, store };
};

const getLoggedInStore = async (storeId) => {
  const store = await getStore({}, storeId);
  // the {}} argument is used here because the getStore function accepts two argument, it's not really neccessary for the getLoggedInStore function
  store.deliveryTime = undefined;
  // unsetting the deliveryTime field since we don't need it for the store but it has to be calculated since the getStore function requires it.
  return store;
};

const updateStoreRequest = async (storeID, updateParam) => {
  // this service is used to update sensitive store data
  // successful request sends a update profile request to admin panel

  // get fields to update
  const {
    address,
    location,
    email,
    name,
    phone_number,
    category,
    tax,
    account_details,
    place_id
  } = updateParam;

  const newDetails = {};
  // Check for fields
  if (address && place_id) {
    newDetails.address = address;
    newDetails.place_id = place_id;
  }
  if (location) newDetails.location = location;
  if (phone_number) newDetails.phone_number = phone_number;
  if (category) newDetails.category = category;
  if (name) newDetails.name = name;
  if (email) newDetails.email = email;
  if (tax) newDetails.tax = tax;
  if (account_details) newDetails.account_details = account_details;
  if (!address && !place_id && !location && !phone_number && !category && !name && !tax && !email && !account_details) return { err: "You haven't specified a field to update. Please try again.", status: 400 };

  // check if store has a pending update
  const checkStoreUpdate = await Store.findById(storeID);
  if (checkStoreUpdate.pendingUpdates === true) {
    // append new updates to existing update document
    let storeUpdate = await StoreUpdate.findOne({ store: storeID });

    await StoreUpdate.findOneAndUpdate(
      { store: storeID },
      {
        $set: { newDetails: { ...storeUpdate.newDetails, ...newDetails } }
      }
    );
  } else {
    // create new update document
    let newUpdate = new StoreUpdate({ store: storeID, newDetails });

    if (await newUpdate.save()) {
      let update = { pendingUpdates: true };
      await Store.findByIdAndUpdate(storeID, update);
    } else {
      return { err: "Update Request Failed, please try again.", status: 400 };
    }
  }

  let storeRes = await getStore({}, storeID);

  return storeRes;
};

const updateStore = async (storeID, updateParam) => {
  // this service is used to update insensitive store data
  const checkStoreUpdate = await Store.findByIdAndUpdate(
    storeID,
    updateParam,
    { new: true }
  );
  if (!checkStoreUpdate) return { err: "An error occurred while updating profile, please try again.", status: 400 };

  let storeRes = await getStore({}, storeID);

  return storeRes;
};

const addLabel = async (storeId, labelParam) => {
  let store = await Store.findById(storeId);

  if (!store) return { err: "Store not found." };
  const { labelTitle, labelThumb } = labelParam;
  store.labels.push({ labelTitle, labelThumb });
  await store.save();
  const newStore = await Store.findById(storeId).select("labels");
  return newStore;
};

const editLabel = async (storeId, labelParam) => {
  let store = await Store.findById(storeId);

  if (!store) return { err: "Store not found.", status: 404 };
  const { labelTitle, labelThumb, labelId } = labelParam;
  await Store.updateOne(
    {
      _id: storeId,
      labels: { $elemMatch: { _id: labelId, }, },
    },
    {
      $set: {
        "labels.$.labelTitle": labelTitle,
        "labels.$.labelThumb": labelThumb,
      },
    },
    { new: true, }
  );
  const newStore = await Store.findOne({
    _id: storeId,
    labels: { $elemMatch: { _id: labelId, }, },
  }).select("labels");
  if (!newStore) return { err: "Store label not found.", status: 404 };
  return newStore;
};

const deleteLabel = async (storeId, labelParam) => {
  let store = await Store.findById(storeId);

  if (!store) return { err: "Store not found." };
  const { labelId } = labelParam;
  const labelChecker = await Store.findOne({
    _id: storeId,
    labels: { $elemMatch: { _id: labelId, }, },
  }).select("labels");
  if (!labelChecker) return { err: "Store label not found.", status: 404 };
  await Store.updateOne({ _id: storeId }, {
    $pull: {
      labels: { _id: labelId },
    },
  });
  return "Store Label deleted successfully.";
};

const getLabels = async (storeId) => {
  let store = await Store.findById(storeId);

  if (!store) return { err: "Store not found." };

  return store.labels;
};

const getStoreSalesStats = async (storeId, days) => {
  if (!days) return { err: "Please, specify amount of days to get stats for.", status: 400 };

  let d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(23);
  d.setMinutes(59);
  d.setSeconds(59);

  let salesStats = await Order.aggregate()
    .match({
      store: mongoose.Types.ObjectId(storeId),
      status: "completed",
      createdAt: { $gt: d },
    })
    .addFields({
      dayOfOrder: { $dayOfWeek: "$createdAt" },
      dateOfOrder: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } }
    })
    .group({
      _id: "$dateOfOrder",
      sales: { $push: "$subtotal" },
    })
    .addFields({
      weekday: { $dayOfWeek: { $dateFromString: { dateString: "$_id" } } },
      weekdate: "$_id",
      totalSales: { $sum: "$sales" },
      totalOrders: { $size: "$sales" },
    })
    .sort("weekday")
    .project({
      _id: 0,
      sales: 0,
    });

  return salesStats;
};

const bestSellers = async (storeId, pagingParam) => {
  const { limit, skip } = pagingParam;

  let bestSellingItems = Order.aggregate()
    .match(
      {
        store: mongoose.Types.ObjectId(storeId),
        status: { $in: ["sent", "ready", "accepted", "enroute", "delivered", "completed"] }
      }
    )
    .lookup({
      from: "products",
      localField: "orderItems.product",
      foreignField: "_id",
      as: "products",
    })
    .unwind("products")
    .unwind("orderItems")
    .group({
      _id: "$products",
      orders: { $push: "$orderItems" },
    })
    .project({
      orders: {
        $filter: {
          input: "$orders",
          as: "order",
          cond: { $eq: ["$$order.product", "$_id._id"] },
        },
      },
    })
    .addFields({
      totalOrders: { $size: "$orders" },
      totalQuantitySold: { $sum: "$orders.qty" },
      grossSales: { $sum: "$orders.totalPrice" },
    })
    .project({
      "_id.orders": 0,
      "_id.category": 0,
      "_id.variantOpt": 0,
      "_id.store": 0,
      "_id.status": 0,
      "_id.variant": 0,
      "_id.label": 0,
      "_id.createdDate": 0,
      "_id._id": 0,
      orders: 0,
    })
    .addFields({
      product: "$_id",
    })
    .project({
      _id: 0,
    })
    .sort("-totalOrders")
    .skip(skip)
    .limit(limit);

  return bestSellingItems;
};

const getStoreFeedback = async (storeId, pagingParam) => {
  const pipeline = [
    {
      $unset: [
        "taxPrice",
        "deliveryPrice",
        "subtotal",
        "totalPrice",
        "isPaid",
        "isDelivered",
        "isFavorite",
        "status",
        "orderItems",
        "paymentMethod",
        "deliveryAddress",
        "orderReview.user.orders",
        "orderReview.user.password",
        "orderReview.user.phone_number",
        "orderReview.user.email",
        "orderReview.user.address",
      ],
    },
  ];
  const {
    limit, skip, fromStarAmount, toStarAmount
  } = pagingParam;

  const feedbacks = await Order.aggregate()
    .match({
      store: mongoose.Types.ObjectId(storeId),
      status: "completed"
    })
    .lookup({
      from: "reviews",
      localField: "_id",
      foreignField: "order",
      as: "orderReview",
    })
    .unwind("orderReview")
    .match({
      $expr: {
        $and: [
          { $gte: ["$orderReview.star", Number(fromStarAmount)] },
          { $lte: ["$orderReview.star", Number(toStarAmount)] },
        ],
      },
    })
    .lookup({
      from: "users",
      localField: "orderReview.user",
      foreignField: "_id",
      as: "orderReview.user",
    })
    .unwind("orderReview.user")
    .project({
      orderReview: 1,
    })
    .sort("-orderReview.star")
    .skip(skip)
    .limit(limit)
    .append(pipeline);
  return feedbacks;
};

const getInventoryList = async (queryParam) => {
  const { skip, limit, labelId } = queryParam;
  const inventoryList = await Product.aggregate()
    .match({
      labels: mongoose.Types.ObjectId(labelId),
    })
    .sort("-createdDate")
    .skip(skip)
    .limit(limit);
  return inventoryList;
};

const requestPayout = async (storeId) => {
  // get store details
  const store = await Store.findById(storeId);

  // set payout variable and check if there's sufficient funds
  let payout = store.account_details.account_balance;
  if (payout === 0) return { err: "Insufficent Funds.", status: 400 };

  // check for pending request
  let oldRequest = await Transaction.findOne({
    type: "Debit",
    receiver: storeId,
    status: "pending"
  });

  if (oldRequest && store.pendingWithdrawal === true) return { err: "You have a pending payout request. Please wait for its approval", status: 400 };

  // create transaction
  let newTransaction = createTransaction({
    amount: payout,
    type: "Debit",
    to: "Store",
    receiver: storeId,
    ref: storeId
  });

  // check for error while creating new transaction
  if (!newTransaction) return { err: "Error requesting payout. Please try again", status: 400 };
  store.pendingWithdrawal = true;
  await store.save();

  return newTransaction;
};

const getPayoutHistory = async (storeId, urlParams) => {
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);
  const payoutHistory = await Transaction
    .find({
      receiver: storeId,
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

export {
  getStores,
  createStore,
  loginStore,
  getLoggedInStore,
  updateStoreRequest,
  addLabel,
  deleteLabel,
  editLabel,
  getStore,
  getLabels,
  getStoresNoGeo,
  getStoreSalesStats,
  bestSellers,
  getStoreFeedback,
  getInventoryList,
  updateStore,
  requestPayout,
  getPayoutHistory
};
