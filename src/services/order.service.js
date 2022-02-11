import mongoose from "mongoose";
import Order from "../models/order.model";
import User from "../models/user.model";
import Store from "../models/store.model";
import Review from "../models/review.model";
import Rider from "../models/rider.model";

import {
  bankTransfer, ussdPayment, cardPayment, verifyTransaction
} from "./payment.service";
import { createNotification } from "./notification.service";

import { sendNewOrderInitiatedMail, sendUserNewOrderAcceptedMail, sendUserNewOrderRejectedMail } from "../utils/sendMail";

const getOrders = async (urlParams) => {
  // initialize match parameters, get limit, skip & sort values
  let matchParam = {};
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);
  let { sort } = urlParams;

  // match for order status
  if (urlParams.status) {
    urlParams.status = urlParams.status.split(",");
    matchParam.status = {
      $in: urlParams.status
    };
  }
  // check and add to match paramters if request is matching for store, convert string to objectId
  if (urlParams.store) { matchParam.store = mongoose.Types.ObjectId(urlParams.store); }

  // check and add to match paramters if request is matching for user, convert string to objectId
  if (urlParams.user) { matchParam.user = mongoose.Types.ObjectId(urlParams.user); }

  // check and add to match paramters if request is matching for isFavorite
  if (urlParams.isFavorite) matchParam.isFavorite = urlParams.isFavorite;

  // check for sort type
  if (urlParams.sortType === "desc") sort = `-${sort}`;
  if (!urlParams.sort) sort = "createdAt";

  // check if request is filtering for minTotalPrice & or maxTotalPrice
  if (urlParams.minTotalPrice) {
    matchParam.totalPrice = {
      $gte: parseInt(urlParams.minTotalPrice, 10),
      $lte: parseInt(urlParams.maxTotalPrice, 10),
    };
  } else {
    matchParam.totalPrice = {
      $gte: 0,
      $lte: 999999999,
    };
  }
  const pipeline = [
    {
      $unset: [
        "store.password",
        "store.email",
        "store.labels",
        "store.phone_number",
        "store.images",
        "store.category",
        "store.openingTime",
        "store.closingTime",
        "product_meta.details.variants",
        "product_meta.details.store",
        "product_meta.details.category",
        "product_meta.details.label",
        "productData",
        "user.password",
        "user.cart",
      ],
    },
  ];

  let orders = Order.aggregate()
    .match(matchParam)
    .lookup({
      from: "products",
      localField: "orderItems.product",
      foreignField: "_id",
      as: "productData",
    })
    .lookup({
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "user",
    })
    .lookup({
      from: "riders",
      localField: "rider",
      foreignField: "_id",
      as: "rider",
    })
    .project({
      status: 1,
      deliveryPrice: 1,
      totalPrice: 1,
      taxPrice: 1,
      subtotal: 1,
      "orderItems._id": 1,
      "orderItems.productName": 1,
      "orderItems.qty": 1,
      "orderItems.price": 1,
      "orderItems.totalPrice": 1,
      "user._id": 1,
      "user.first_name": 1,
      "user.last_name": 1,
      "user.phone_number": 1,
      "rider._id": 1,
      "rider.first_name": 1,
      "rider.last_name": 1,
      orderId: 1,
      createdAt: 1,
    })
    .unwind("$user")
    .append(pipeline)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return orders;
};

const createOrder = async (orderParam) => {
  const { store, user } = orderParam;

  // validate user
  const vUser = await User.findById(user);
  if (!vUser) return { err: "User does not exists.", status: 404 };

  // validate store
  const vStore = await Store.findById(store);
  if (!vStore) return { err: "Store not found.", status: 404 };

  // generates random unique id;
  let orderId = () => {
    let s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
      // return id of format 'soft - aaaaa'
    return `soft-${s4()}`;
  };

  // creates an order for user after all validation passes
  const order = new Order(orderParam);
  order.orderId = orderId();

  let newOrder = await order.save();

  // Adds new order to user model
  vUser.orders.push(newOrder._id);
  await vUser.save();

  // Returns new order to response
  const pipeline = [
    {
      $unset: [
        "store.password",
        "store.email",
        "store.labels",
        "store.phone_number",
        "store.images",
        "store.category",
        "store.openingTime",
        "store.closingTime",
        "productData",
        "user.password",
        "user.cart",
        "user.orders",
      ],
    },
  ];
  const neworder = await Order.aggregate()
    .match({
      orderId: newOrder.orderId,
    })
    .lookup({
      from: "products",
      localField: "orderItems.product",
      foreignField: "_id",
      as: "productData",
    })
    .lookup({
      from: "stores",
      localField: "store",
      foreignField: "_id",
      as: "store",
    })
    .lookup({
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "user",
    })
    .addFields({
      user: { $arrayElemAt: ["$user", 0] },
      store: { $arrayElemAt: ["$store", 0] },
      // operations to calculate total price in each order item
      orderItems: {
        $map: {
          input: "$orderItems",
          as: "orderItem",
          in: {
            $mergeObjects: [
              "$$orderItem",
              {
                totalPrice: {
                  $multiply: ["$$orderItem.qty", "$$orderItem.price"],
                },
                // operations to calculate total price in each selected variants in each order items
                selectedVariants: {
                  $map: {
                    input: "$$orderItem.selectedVariants",
                    as: "selectedVariant",
                    in: {
                      $mergeObjects: [
                        "$$selectedVariant",
                        {
                          totalPrice: {
                            $multiply: [
                              "$$selectedVariant.quantity",
                              "$$selectedVariant.itemPrice",
                            ],
                          },
                        },
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      },
    })
  // operations to calculate total price of all products' totalPrice field
    .addFields({
      totalProductPrice: {
        $sum: {
          $map: {
            input: "$orderItems",
            as: "orderItem",
            in: {
              $sum: "$$orderItem.totalPrice",
            },
          },
        },
      },
      // operations to calculate total price of all selectedVariants' totalPrice field
      totalVariantPrice: {
        $sum: {
          $map: {
            input: "$orderItems.selectedVariants",
            as: "selectedVariant",
            in: {
              $sum: "$$selectedVariant.totalPrice",
            },
          },
        },
      },
    })
    .addFields({
      subtotal: { $add: ["$totalProductPrice", "$totalVariantPrice"] },
    })
    .addFields({
      taxPrice: {
        $multiply: [
          0.075,
          { $add: ["$totalProductPrice", "$totalVariantPrice"] },
        ],
      },
    })
    // calculate total price for the order
    .addFields({
      totalPrice: {
        $add: [
          "$taxPrice",
          "$totalProductPrice",
          "$totalVariantPrice",
          "$deliveryPrice",
        ],
      },
    })
    .append(pipeline);

  if (neworder[0].paymentMethod === "Transfer") {
    const payload = {
      tx_ref: neworder[0].orderId,
      amount: neworder[0].totalPrice,
      email: neworder[0].user.email,
      phone_number: neworder[0].user.phone_number,
      currency: "NGN",
      fullname: `${neworder[0].user.first_name} ${neworder[0].user.last_name}`,
      narration: `softshop payment - ${neworder[0].orderId}`,
      is_permanent: 0,
    };
      // eslint-disable-next-line no-use-before-define
    neworder[0].paymentResult = await bankTransfer(payload);
  }
  if (neworder[0].paymentMethod === "Card") {
    const payload = {
      token: orderParam.card, // This is the card token returned from the transaction verification endpoint as data.card.token
      currency: "NGN",
      country: "NG",
      amount: neworder[0].totalPrice,
      email: neworder[0].user.email,
      first_name: neworder[0].user.first_name,
      last_name: neworder[0].user.last_name,
      frequency: 10,
      narration: `softshop payment - ${neworder[0].orderId}`,
      tx_ref: neworder[0].orderId
    };
    neworder[0].paymentResult = await cardPayment(payload);
  }
  if (neworder[0].paymentMethod === "Ussd") {
    const payload = {
      tx_ref: neworder[0].orderId,
      account_bank: orderParam.bankCode,
      amount: neworder[0].totalPrice,
      currency: "NGN",
      email: neworder[0].user.email,
      phone_number: neworder[0].user.phone_number,
      fullname: `${neworder[0].user.first_name} ${neworder[0].user.last_name}`
    };
    neworder[0].paymentResult = await ussdPayment(payload);
  }

  if (neworder[0].paymentResult.status === "error") {
    // Update order with more details regardless of failed payment
    let orderUpdate = await Order.findById(neworder[0]._id);
    orderUpdate.orderItems = neworder[0].orderItems;
    orderUpdate.totalPrice = neworder[0].totalPrice;
    orderUpdate.taxPrice = neworder[0].taxPrice;
    orderUpdate.subtotal = neworder[0].subtotal;
    orderUpdate.paymentResult = neworder[0].paymentResult;
    orderUpdate.markModified("paymentResult");
    await orderUpdate.save();
    return { err: `${neworder[0].paymentResult.message} Order has been initiated, please try paying again or select another payment method.`, status: 400 };
  }

  // update order
  let orderUpdate = await Order.findById(neworder[0]._id);
  orderUpdate.orderItems = neworder[0].orderItems;
  orderUpdate.totalPrice = neworder[0].totalPrice;
  orderUpdate.taxPrice = neworder[0].taxPrice;
  orderUpdate.subtotal = neworder[0].subtotal;
  orderUpdate.paymentResult = neworder[0].paymentResult;
  orderUpdate.markModified("paymentResult");
  await orderUpdate.save();

  // send email notification on order initiated
  await sendNewOrderInitiatedMail(neworder[0].user.email, neworder[0].totalPrice, neworder[0].store.name);
  let riders = await Rider.find();
  let ridersId = [];
  if (riders) {
    ridersId = riders.map((rider) => {
      return rider._id;
    });
  }
  await createNotification(ridersId, newOrder._id);

  return neworder[0];
};

const toggleFavorite = async (orderID) => {
  // adds or remove users favorite order
  const order = await Order.findById(orderID);

  if (!order) {
    return { err: "Order not found", status: 404 };
  }

  order.isFavorite = !order.isFavorite;
  await order.save();

  if (order.isFavorite) {
    return { msg: "Order marked as favorite." };
  }
  return { msg: "Order removed from favorites." };
};

const getOrderDetails = async (orderID) => {
  const order = await Order.findById(orderID);

  if (!order) {
    return { err: "Order not found", status: 404 };
  }
  // get users order details
  // can be used by users, stores and admin

  const pipeline = [
    {
      $unset: [
        "store.password",
        "store.email",
        "store.labels",
        "store.phone_number",
        "store.images",
        "store.category",
        "store.openingTime",
        "store.closingTime",
        "productData",
        "user.password",
        "user.cart",
        "user.orders",
        "rider.password",
        "rider.orders",
      ],
    },
  ];
  const orderDetails = await Order.aggregate()
    .match({
      orderId: order.orderId,
    })
    .lookup({
      from: "products",
      localField: "orderItems.product",
      foreignField: "_id",
      as: "productData",
    })
    .lookup({
      from: "stores",
      localField: "store",
      foreignField: "_id",
      as: "store",
    })
    .lookup({
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "user",
    })
    .lookup({
      from: "riders",
      localField: "rider",
      foreignField: "_id",
      as: "rider",
    })
    .lookup({
      from: "customfees",
      localField: "orderItems.product",
      foreignField: "product",
      as: "productFees",
    })
    .addFields({
      customFees: { $sum: "$productFees.amount" },
      user: { $arrayElemAt: ["$user", 0] },
      store: { $arrayElemAt: ["$store", 0] },
      rider: { $arrayElemAt: ["$rider", 0] },
    })
    .append(pipeline);

  return orderDetails;
};

const editOrder = async (orderID, orderParam) => {
  // can be used by both stores and users
  await Order.findByIdAndUpdate(
    orderID,
    { $set: orderParam },
    { omitUndefined: true, new: true, useFindAndModify: false }
  );
  const pipeline = [
    {
      $unset: [
        "store.password",
        "store.labels",
        "store.phone_number",
        "store.images",
        "store.category",
        "store.openingTime",
        "store.closingTime",
        "productData",
        "user.password",
        "user.cart",
        "user.orders",
      ],
    },
  ];
  const newOrder = await Order.aggregate()
    .match({
      _id: mongoose.Types.ObjectId(orderID),
    })
    .lookup({
      from: "products",
      localField: "orderItems.product",
      foreignField: "_id",
      as: "productData",
    })
    .lookup({
      from: "stores",
      localField: "store",
      foreignField: "_id",
      as: "store",
    })
    .lookup({
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "user",
    })
    .addFields({
      user: { $arrayElemAt: ["$user", 0] },
      store: { $arrayElemAt: ["$store", 0] },
      orderItems: {
        $map: {
          input: "$orderItems",
          as: "orderItem",
          in: {
            $mergeObjects: [
              "$$orderItem",
              {
                totalPrice: {
                  $multiply: ["$$orderItem.qty", "$$orderItem.price"],
                },
                selectedVariants: {
                  $map: {
                    input: "$$orderItem.selectedVariants",
                    as: "selectedVariant",
                    in: {
                      $mergeObjects: [
                        "$$selectedVariant",
                        {
                          totalPrice: {
                            $multiply: [
                              "$$selectedVariant.quantity",
                              "$$selectedVariant.itemPrice",
                            ],
                          },
                        },
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      },
    })
    .addFields({
      totalProductPrice: {
        $sum: {
          $map: {
            input: "$orderItems",
            as: "orderItem",
            in: {
              $sum: "$$orderItem.totalPrice",
            },
          },
        },
      },
      totalVariantPrice: {
        $sum: {
          $map: {
            input: "$orderItems.selectedVariants",
            as: "selectedVariant",
            in: {
              $sum: "$$selectedVariant.totalPrice",
            },
          },
        },
      },
    })
    .addFields({
      subtotal: { $add: ["$totalProductPrice", "$totalVariantPrice"] },
    })
    .addFields({
      taxPrice: {
        $multiply: [
          0.075,
          { $add: ["$totalProductPrice", "$totalVariantPrice"] },
        ],
      },
    })
    .addFields({
      totalPrice: {
        $add: [
          "$taxPrice",
          "$totalProductPrice",
          "$totalVariantPrice",
          "$deliveryPrice",
        ],
      },
    })

    .append(pipeline);
  await Order.findOneAndUpdate(
    { _id: newOrder[0]._id },
    {
      $set: {
        orderItems: newOrder[0].orderItems,
        totalPrice: newOrder[0].totalPrice,
        taxPrice: newOrder[0].taxPrice,
        subtotal: newOrder[0].subtotal,
      },
    },
    { omitUndefined: true, new: true, useFindAndModify: false }
  );
  // send email to user once store accepts order
  if (orderParam.status === "accepted") {
    await sendUserNewOrderAcceptedMail(newOrder[0].store.email, newOrder[0].store.name);
  }
  // send email to user once store rejects order

  if (orderParam.status === "canceled") {
    await sendUserNewOrderRejectedMail(newOrder[0].store.email, newOrder[0].store.name);
  }
  return newOrder[0];
};

const getCartItems = async (userID) => {
  try {
    // get user cart items
    let user = await User.findById(userID)
      .select("cart")
      .populate("cart.product_id");
    return user;
  } catch (error) {
    return { err: "Error getting user cart items." };
  }
};

const reviewOrder = async (review) => {
  // check if user exists
  const user = await User.findById(review.user);
  if (!user) return { err: "User does not exists.", status: 404 };

  // check if order exists in user's account
  const order = await Order.findOne({
    _id: mongoose.Types.ObjectId(review.order),
    user: mongoose.Types.ObjectId(review.user),
    status: "completed"
  });
  if (!order) return { err: "Order not found.", status: 404 };

  // check if user has made any review
  const isReviewed = await Review.findOne({
    order: review.order,
    user: review.user
  });
  if (isReviewed) return { err: "Your review has been submitted for this order already.", status: 409 };

  const userReview = new Review(review);
  await userReview.save();

  const newReview = Review.findById(userReview._id).populate("user", "first_name last_name");

  return newReview;
};

const encryptDetails = async (cardDetails) => {
  // let result = await encryptCard(cardDetails);
  let charge = await cardPayment(cardDetails);
  return charge;
};

export {
  getOrders,
  createOrder,
  toggleFavorite,
  getOrderDetails,
  getCartItems,
  editOrder,
  reviewOrder,
  encryptDetails
};

// Updates
// Make getOrders able to fetch history for both stores and users by adding the parameters in the url query.
// scrap the toggleFavorite, cancel, deliver, edit, receive and complete order functions, operations can be carried out within the editOrder function.
// Get favorites can also be added as a parameter to the getOrders function.
