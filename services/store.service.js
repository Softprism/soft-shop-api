import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import Store from "../models/store.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

const getStores = async (urlParams) => {
  try {
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
    let sort = urlParams.sort;

    // check for sort type
    if (urlParams.sortType == "desc") sort = "-" + sort;
    if (!urlParams.sort) sort = "createdAt";

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

    if (urlParams.long && urlParams.lat && urlParams.radius) {
      var long = parseFloat(urlParams.long);
      var lat = parseFloat(urlParams.lat);
      var radian = parseFloat(urlParams.radius / 3963.2);
    }

    // cleaning up the urlParams
    delete urlParams.limit;
    delete urlParams.skip;
    delete urlParams.rating;
    delete urlParams.long;
    delete urlParams.lat;

    // aggregating stores
    const stores = Store.aggregate()
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
      //looking up the product collection for each stores
      .lookup({
        from: "products",
        localField: "_id",
        foreignField: "store",
        as: "products",
      })
      //looking up the order collection for each stores
      .lookup({
        from: "orders",
        localField: "_id",
        foreignField: "store",
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
        averageRating: { $ceil: { $avg: "$orderReview.star" } },
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
        if (store.averageRating == rating) {
          storesWithRating.push(store);
        }
      });
      return storesWithRating;
    } else {
      return stores;
    }
  } catch (err) {
    return err;
  }
};

const getStoresNoGeo = async (urlParams) => {
  try {
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
    let sort = urlParams.sort;

    // check for sort type
    if (urlParams.sortType == "desc") sort = "-" + sort;
    if (!urlParams.sort) sort = "createdAt";

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
    const stores = Store.aggregate()
      // matching stores with matchParam
      .match(matchParam)
      //looking up the product collection for each stores
      .lookup({
        from: "products",
        localField: "_id",
        foreignField: "store",
        as: "products",
      })
      //looking up the order collection for each stores
      .lookup({
        from: "orders",
        localField: "_id",
        foreignField: "store",
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
        averageRating: { $ceil: { $avg: "$orderReview.star" } },
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
        if (store.averageRating == rating) {
          storesWithRating.push(store);
        }
      });
      return storesWithRating;
    } else {
      return stores;
    }
  } catch (err) {
    return err;
  }
};

const getStore = async (storeId) => {
  try {
    // declare fields to exclude from response
    const pipeline = [
      {
        $unset: [
          "products",
          "productReview",
          "password",
          "email",
          "phone_number",
          "orders",
          "orderReview",
        ],
      },
    ];

    // aggregating stores
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
      //looking up the order collection for each stores
      .lookup({
        from: "orders",
        localField: "_id",
        foreignField: "store",
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
        averageRating: { $ceil: { $avg: "$orderReview.star" } },
        productCount: { $size: "$products" },
        orderCount: { $size: "$orders" },
      })
      .addFields({
        averageRating: { $ifNull: ["$averageRating", 0] },
      })
      // appending excludes
      .append(pipeline);

    if (store.length < 1) {
      store = await Store.aggregate()
        // matching with requested store
        .match({
          _id: mongoose.Types.ObjectId(storeId),
        })
        //looking up the order collection for each stores
        .lookup({
          from: "orders",
          localField: "_id",
          foreignField: "store",
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
          averageRating: { $ceil: { $avg: "$orderReview.star" } },
          orderCount: { $size: "$orders" },
        })
        .addFields({
          averageRating: { $ifNull: ["$averageRating", 0] },
        })
        .append(pipeline);
    }
    return store[0];
  } catch (err) {
    return { err: "failed to get store data" };
  }
};

const createStore = async (StoreParam) => {
  try {
    const {
      name,
      address,
      email,
      phone_number,
      password,
      openingTime,
      closingTime,
      location,
    } = StoreParam;

    let store = await Store.findOne({ email });

    if (store) {
      throw { err: "A store with this email already exists" };
    }

    if (!openingTime.includes(":") || !closingTime.includes(":")) {
      throw { err: "Invalid time format" };
    }

    const newStore = new Store(StoreParam);
    const salt = await bcrypt.genSalt(10);

    // Replace password from store object with encrypted one
    newStore.password = await bcrypt.hash(password, salt);

    await newStore.save();

    const payload = {
      store: {
        id: newStore.id,
      },
    };

    // Generate and return token to server
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 36000,
    });

    if (!token) {
      throw { err: "Missing Token" };
    }

    return token;
  } catch (err) {
    return err;
  }
};

const loginStore = async (StoreParam) => {
  try {
    const { email, password } = StoreParam;

    let store = await Store.findOne({ email });

    if (!store) throw { err: "Invalid Credentials" };

    // Check if password matches with stored hash
    const isMatch = await bcrypt.compare(password, store.password);

    if (!isMatch) {
      throw { err: "Invalid Credentials" };
    }

    const payload = {
      store: {
        id: store.id,
      },
    };

    // Generate and return token to server
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 36000,
    });

    return token;
  } catch (err) {
    console.log(err);
    return err;
  }
};

const getLoggedInStore = async (userParam) => {
  console.log("running");
  try {
    const store = await Store.findById(userParam).select("-password");
    return store;
  } catch (err) {
    // console.error(err.message);
    return err;
  }
};

const updateStore = async (storeID, updateParam) => {
  try {
    const {
      email,
      password,
      address,
      phone_number,
      images,
      openingTime,
      closingTime,
      category,
      labels,
      tax,
    } = updateParam;

    const storeUpdate = {};

    // Check for fields
    if (address) storeUpdate.address = address;
    if (images) storeUpdate.images = images;
    if (email) storeUpdate.email = email;
    if (openingTime) {
      if (!storeUpdate.openingTime.includes(":")) {
        delete storeUpdate.openingTime;
        throw { err: "Invalid time" };
      }
      storeUpdate.openingTime = openingTime;
    }
    if (closingTime) {
      if (!storeUpdate.closingTime.includes(":")) {
        delete storeUpdate.closingTime;
        throw { err: "Invalid time" };
      }
      storeUpdate.closingTime = closingTime;
    }
    if (phone_number) storeUpdate.email = phone_number;
    if (category) storeUpdate.category = category;
    if (labels) storeUpdate.labels = labels;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      storeUpdate.password = await bcrypt.hash(password, salt);
    }

    let store = await Store.findById(storeID);

    if (!store) throw { err: "Store not found" };
    console.log(storeID, storeUpdate);
    store = await Store.findByIdAndUpdate(
      storeID,
      { $set: storeUpdate },
      { omitUndefined: true, new: true, useFindAndModify: false }
    );

    let storeRes = await Store.findById(storeID).select("-password, -__v");

    return storeRes;
  } catch (err) {
    console.log(err);
    return err;
  }
};

const addLabel = async (storeId, labelParam) => {
  let store = await Store.findById(storeId);

  if (!store) throw { err: "Store not found" };

  store.labels.push(labelParam);
  await store.save();
  return await Store.findById(storeId).select("-password, -__v");
};

const getLabels = async (storeId) => {
  // get store labels
  let store = await Store.findById(storeId);

  if (!store) throw { err: "Store not found" };

  return store.labels;
};

const getStoreSalesStats = async (storeId, days) => {
  try {
    if (!days) throw { err: "please specify amount of days to get stats for" };
    var d = new Date();
    d.setDate(d.getDate() - days);

    let salesStats = await Order.aggregate()
      .match({
        store: mongoose.Types.ObjectId(storeId),
        status: "delivered",
        createdAt: { $gt: d },
      })
      .addFields({
        dayOfOrder: { $dayOfWeek: "$createdAt" },
      })
      .group({
        _id: "$dayOfOrder",
        sales: { $push: "$subtotal" },
      })
      .addFields({
        weekday: { $toInt: "$_id" },
        totalSales: { $sum: "$sales" },
        totalOrders: { $size: "$sales" },
      })
      .sort("weekday")
      .project({
        _id: 0,
        sales: 0,
      });

    return salesStats;
  } catch (error) {
    return error;
  }
};

const bestSellers = async (storeId, pagingParam) => {
  try {
    const { limit, skip } = pagingParam;
    // or pass an array
    const pipeline1 = [
      {
        $filter: {
          input: "$orders.orderItems",
          as: "orderItem",
          cond: { $eq: ["$$orderItem.product_name", "$product_name"] },
        },
      },
    ];
    let bestSellingItems = Order.aggregate()
      .match({ store: mongoose.Types.ObjectId(storeId) })
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
      .sort("-totalQuantitySold")
      .skip(skip)
      .limit(limit);

    return bestSellingItems;
  } catch (error) {
    return error;
  }
};

export {
  getStores,
  createStore,
  loginStore,
  getLoggedInStore,
  updateStore,
  addLabel,
  getStore,
  getLabels,
  getStoresNoGeo,
  getStoreSalesStats,
  bestSellers,
};
