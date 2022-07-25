/* eslint-disable no-await-in-loop */
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

import { getDistance } from "../utils/get-distance";
import {
  sendPasswordChangeMail, sendStorePasswordResetRequestMail, sendStoreUpdateRequestMail
} from "../utils/sendMail";
import Ledger from "../models/ledger.model";
import Deletion from "../models/delete-requests.model";

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
    radian = parseFloat(urlParams.radius / 6378.1); // calculate in km
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
    // match verified stores
    .match({ isVerified: true })
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
            status: { $in: ["sent", "ready", "accepted", "enroute", "arrived", "delivered"] },
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
  if (!urlParams.place_id) urlParams.place_id = "ChIJ73FBMSH3OxARDMvAq2uA6SM"; // Victoria garden City, Lekki, Nigeria

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
    // match verified stores
    .match({ isVerified: true })
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
            status: { $in: ["sent", "ready", "accepted", "enroute", "delivered", "arrived"] },
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
      isVerified: true,
    })
    // looking up the store in the product collection
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
            status: "delivered",
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
              status: { $in: ["sent", "ready", "accepted", "enroute", "delivered", "arrived"] },
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
    owner_name,
    owner_email,
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
  StoreParam.labels = [{
    labelTitle: "General",
    labelThumb: "https://soft-shop.app/uploads/label/434764-nasco.png"
  }];
  const newStore = new Store(StoreParam);
  await newStore.save();

  let token = await getJwt(newStore.id, "store");

  return token;
};

const loginStore = async (StoreParam) => {
  const {
    email, password
  } = StoreParam;

  let store = await Store.findOne({ email }).select("password isVerified isActive resetPassword pendingUpdates name pendingWithdrawal vendorPushDeviceToken orderPushDeviceToken category");

  if (!store) {
    return { err: "Invalid email. Please try again.", status: 400 };
  }

  // Check if password matches with stored hash
  const isMatch = await bcrypt.compare(password, store.password);

  if (!isMatch) {
    return { err: "The password entered is invalid, please try again.", status: 401 };
  }

  if (process.env.NODE_ENV === "production" && store.isVerified === false) {
    return { err: "Please complete your verification.", status: 401 };
  }
  if (store.isVerified === false) {
    return { err: "Sorry store is not yet verified, kindly contact stores@soft-shop.app", status: 401 };
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

  // check if store email already exist
  const store = await Store.findOne({ email });
  if (store) {
    return { err: "A store with this email already exists.", status: 400 };
  }
  // check if store has a pending update
  const checkStoreUpdate = await Store.findById(storeID);
  if (!checkStoreUpdate) {
    return { err: "Store does not already exists.", status: 400 };
  }
  if (checkStoreUpdate.pendingUpdates === true) {
    // append new updates to existing update document
    let storeUpdate = await StoreUpdate.findOne({ store: storeID });
    if (!storeUpdate) return { err: "Store update does not exist", status: 400 };
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
      await sendStoreUpdateRequestMail(checkStoreUpdate.email);
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

  // send mail to notify user of password change
  if (updateParam.password) {
    sendPasswordChangeMail(checkStoreUpdate.email);
  }
  let storeRes = await getStore({}, storeID);

  return storeRes;
};

const updateStorePhoto = async (storeID, updateParam) => {
  // this service is used to update  store pictures
  const {
    profilePhoto, pictures
  } = updateParam;
  const checkStoreUpdate = await Store.findByIdAndUpdate(
    storeID,
    {
      $set: {
        ...profilePhoto
        && { "images.profilePhoto": profilePhoto },
        ...pictures && { "images.pictures": pictures },
      }
    },
    { new: true }
  ).select("_id name images");
  if (!checkStoreUpdate) return { err: "An error occurred while updating profile, please try again.", status: 400 };

  let storeRes = await getStore({}, storeID);

  return storeRes;
};

const addLabel = async (storeId, labelParam) => {
  let store = await Store.findById(storeId);

  if (!store) return { err: "Store not found." };
  const { labelTitle, labelThumb } = labelParam;

  // check if the General label is being deletred
  const genLabelChecker = await Store.findOne({
    _id: storeId,
    labels: { $elemMatch: { labelTitle: "General" }, },
  });
  if (genLabelChecker && labelTitle === "General") return { err: "You can't add label titled 'General'.", status: 400 };

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
  // let theLabel = await Store.findOne(
  //   {
  //     _id: storeId,
  //     labels: { $elemMatch: { _id: labelId, }, },
  //   }
  // );
  let selectedLabel = mongoose.Types.ObjectId(labelId);
  const newStore = await Store.aggregate()
    .match({
      _id: mongoose.Types.ObjectId(storeId),
    })
    .addFields({
      label: selectedLabel
    })
    .project({
      label: {
        $filter: {
          input: "$labels",
          as: "labels",
          cond: {
            $and: {
              $eq: ["$$labels._id", "$label"]
            }
          }
        }
      }
    });

  if (!newStore) return { err: "Store label not found.", status: 404 };
  return newStore[0].label;
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

  // check if the General label is being deletred
  const genLabelChecker = await Store.findOne({
    _id: storeId,
    labels: { $elemMatch: { _id: labelId, labelTitle: "General" }, },
  });
  if (genLabelChecker) return { err: "You can't delete the General Label.", status: 400 };

  await Store.updateMany({ _id: storeId }, {
    $pull: { labels: { _id: labelId }, },
  });
  const products = await Product.updateMany(
    { labels: { $in: labelId } },
    { $pull: { labels: labelId } }
  );
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
      status: "delivered",
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
        status: { $in: ["sent", "ready", "accepted", "enroute", "delivered", "arrived"] }
      }
    )
    // lookup the products in each order
    .lookup({
      from: "products",
      localField: "orderItems.product",
      foreignField: "_id",
      as: "products",
    })
    // unwind the products array to get each product for each order
    .unwind("products")
    // unwind the orderItems field so we can get each item for each product
    // the goal is to eventually have an object with same product in the orderItems and product field
    .unwind("orderItems")
    // group by product and push the orderItems to each group
    // so we can eventually get our goal
    .group({
      _id: "$products",
      orders: { $push: "$orderItems" },
      allSubTotals: { $sum: "$subtotal" },
    })
    // filter the orders array so we only have same product in the orderItems field and product field
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
        // "taxPrice",
        // "deliveryPrice",
        // "subtotal",
        // "totalPrice",
        // "isPaid",
        // "isDelivered",
        // "isFavorite",
        // "status",
        // "orderItems",
        // "paymentMethod",
        // "deliveryAddress",
        "orderReview.user.pushNotifications",
        "orderReview.user.smsNotifications",
        "orderReview.user.promotionalNotifications",
        "orderReview.user.cards",
        "orderReview.user.pushDeviceToken",
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
      status: "delivered"
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
      orderId: 1
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
  let store = await Store.findById(storeId);

  // check if store has set account details
  if (!store.account_details.account_number) {
    return { err: "Please update your account details.", status: 400 };
  }

  // get ledger details
  let ledger = await Ledger.findOne({});

  // set payout variable and check if there's sufficient funds
  let payout = store.account_details.account_balance;
  if (payout < 1000) return { err: "Insufficent Funds. You need up to NGN1000 to request for payouts.", status: 400 };

  // check for pending store and ledger request
  let oldStoreRequest = await Transaction.findOne({
    type: "Debit",
    status: "pending",
    ref: storeId,
    to: "Store"
  });

  if (oldStoreRequest && store.pendingWithdrawal === true) {
    await Transaction.findOneAndUpdate(
      {
        type: "Debit",
        ref: storeId,
        status: "pending",
        to: "Store"
      },
      { $inc: { amount: Number(store.account_details.account_balance) } }
    );

    // update store account balance
    store.account_details.total_debit += Number(payout);
    store.account_details.account_balance = Number(store.account_details.total_credit) - Number(store.account_details.total_debit);
    await store.save();

    return { email: store.email, payout, transaction: oldStoreRequest };
  }

  // create  debit transaction for store
  let newStoreTransaction = await createTransaction({
    amount: payout,
    type: "Debit",
    to: "Store",
    receiver: storeId,
    ref: storeId,
    fee: 0
  });

  // check for error while creating new transaction
  if (!newStoreTransaction) return { err: "Error requesting payout. Please try again", status: 400 };
  store.pendingWithdrawal = true;
  await store.save();

  return { email: store.email, payout, transaction: newStoreTransaction };
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

const resetPassword = async ({ email }) => {
  const checkEmail = await Store.findOne({ email });
  if (!checkEmail) {
    return {
      err: "Email doesnt exist.",
      status: 409,
    };
  }
  if (checkEmail.resetPassword === "initiated") {
    return { err: "Please wait for the approval of your recent password reset request, or contact support for further assistance.", status: 400 };
  }
  if (checkEmail) {
    // initiate reset password
    checkEmail.resetPassword = "initiated";
    await checkEmail.save();
    return "Your reset password request has been sent. You'll receive a mail containing your new password soon.";
  }
  await sendStorePasswordResetRequestMail(email);
  return { err: "Please enter your email registered with softshop", status: 400 };
};

const deleteAccount = async (storeId) => {
  // this service is used to delete store account
  // successful request sends a delete request to admin panel
  // set store isVerified to false
  const store = await Store.findById(storeId);
  store.isVerified = false;
  await store.save();

  // delete store account
  await Deletion.create({
    account_type: "Store",
    account_id: storeId
  });
  return "Your account has been scheduled for deletion. We will contact you shortly.";
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
  getPayoutHistory,
  resetPassword,
  updateStorePhoto,
  deleteAccount
};
