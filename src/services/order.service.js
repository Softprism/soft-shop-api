import mongoose from "mongoose";
import { SubscribeRulesList } from "twilio/lib/rest/video/v1/room/roomParticipant/roomParticipantSubscribeRule";
import Order from "../models/order.model";
import User from "../models/user.model";
import Store from "../models/store.model";
import Review from "../models/review.model";

import {
  bankTransfer, ussdPayment, cardPayment, verifyTransaction, encryptCard
} from "./payment.service";
import { getDistanceService, getDistanceServiceForDelivery } from "../utils/get-distance";
import Rider from "../models/rider.model";
import UserDiscount from "../models/user-discount.model";
import { getUserBasketItems } from "./user.service";
import Userconfig from "../models/configurations.model";
import Referral from "../models/referral.model";
import { createTransaction } from "./transaction.service";

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
      from: "deliveries",
      localField: "delivery",
      foreignField: "_id",
      as: "delivery",
    })
    .project({
      "store.name": 1,
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
      "rider.phone_number": 1,
      "delivery.status": 1,
      "delivery.riderStatus": 1,
      orderId: 1,
      createdAt: 1,
    })
    .unwind("$user", "$store")
    // .unwind({
    //   path: "$rider",
    //   preserveNullAndEmptyArrays: true
    // })
    // .unwind({
    //   path: "$delivery",
    //   preserveNullAndEmptyArrays: true
    // })
    .append(pipeline)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return orders;
};

const createOrder = async (orderParam) => {
  const {
    store, user, deliveryPrice
  } = orderParam;

  // validate user
  const vUserPromise = User.findById(user);

  // validate store
  const vStorePromise = Store.findById(store);

  const [vUser, vStore] = await Promise.all([vUserPromise, vStorePromise]);

  if (!vStore) return { err: "Store not found.", status: 404 };
  // validate if store is active
  if (!vStore.isActive) {
    return { err: "Sorry you can't create order from an inactive store.", status: 409 };
  }

  const userbasketItemsPromise = getUserBasketItems(user);

  let userPlatFormFeePromise = Userconfig.findOne({
    user: "User",
    userId: user,
  });
  const [userbasketItems, userPlatFormFee] = await Promise.all([userbasketItemsPromise, userPlatFormFeePromise]);
  let subtotalFee = (userPlatFormFee.fee / 100) * userbasketItems.totalPrice;
  let vatFee = 0.075 * subtotalFee;
  let taxFee = subtotalFee + vatFee;
  orderParam.subtotal = Math.ceil(Number(userbasketItems.totalPrice));
  orderParam.taxPrice = Math.ceil(Number(taxFee));
  orderParam.totalPrice = Number(deliveryPrice + orderParam.subtotal + orderParam.taxPrice);
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

  // check for referral bonus and add it to subtotal discount
  let referralBonus = await Referral.findOne({ referral_id: vUser.referral_id, isConsumer: true });
  // check if referral exists
  if (referralBonus && referralBonus.account_balance >= 600 && orderParam.subtotalDiscountPrice > 500) {
    let existingSdp = orderParam.subtotalDiscountPrice;
    orderParam.subtotalDiscountPrice -= referralBonus.account_balance;

    if (orderParam.subtotalDiscountPrice < 500) {
      let offsetBalance = 500 - existingSdp;
      referralBonus.total_debit += Math.abs(offsetBalance);
      orderParam.totalDiscountedPrice -= Math.abs(offsetBalance);
      referralBonus.account_balance = Number(referralBonus.total_credit) - Number(referralBonus.total_debit);
      await referralBonus.save();
      orderParam.subtotalDiscountPrice = 500;
    } else {
      referralBonus.total_debit += Number(referralBonus.account_balance);
      referralBonus.account_balance = Number(referralBonus.total_credit) - Number(referralBonus.total_debit);
      orderParam.totalDiscountedPrice -= referralBonus.account_balance;
      await referralBonus.save();
    }
    orderParam.subtotalDiscount = true;
  }

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
        "taxFee",
        "orderFee"
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
    .append(pipeline);

  let discountCheck = orderParam.totalDiscountedPrice > 0;
  if (neworder[0].paymentMethod === "Transfer") {
    // eslint-disable-next-line no-use-before-define
    try {
      const payload = {
        tx_ref: neworder[0].orderId,
        amount: discountCheck ? neworder[0].totalDiscountedPrice : neworder[0].totalPrice,
        email: neworder[0].user.email,
        phone_number: neworder[0].user.phone_number,
        currency: "NGN",
        fullname: `${neworder[0].user.first_name} ${neworder[0].user.last_name}`,
        narration: `softshop payment - ${neworder[0].orderId}`,
      };
      neworder[0].paymentResult = await bankTransfer(payload);
      // add account name to response
      neworder[0].paymentResult.account_name = `softshop payment ${neworder[0].paymentResult.meta.authorization.transfer_note.substring(neworder[0].paymentResult.meta.authorization.transfer_note.indexOf("-"))}`;
    } catch (error) {
      // Update order with more details regardless of failed payment
      let orderUpdate = await Order.findById(neworder[0]._id);
      orderUpdate.orderItems = neworder[0].orderItems;
      // orderUpdate.totalPrice = neworder[0].totalPrice;
      // orderUpdate.taxPrice = neworder[0].taxPrice;
      // orderUpdate.subtotal = neworder[0].subtotal;
      orderUpdate.paymentResult = neworder[0].paymentResult;
      orderUpdate.markModified("paymentResult");
      await orderUpdate.save();
      return { err: `${neworder[0].paymentResult.message}...We're bnable to process transfer payments at this time, please try other payment options.`, status: 400 };
    }
  }
  if (neworder[0].paymentMethod === "Card") {
    try {
      const payload = {
        token: orderParam.card, // This is the card token returned from the transaction verification endpoint as data.card.token
        currency: "NGN",
        country: "NG",
        amount: discountCheck ? neworder[0].totalDiscountedPrice : neworder[0].totalPrice,
        email: neworder[0].user.email,
        first_name: neworder[0].user.first_name,
        last_name: neworder[0].user.last_name,
        frequency: 10,
        narration: `softshop payment - ${neworder[0].orderId}`,
        tx_ref: neworder[0].orderId
      };
      neworder[0].paymentResult = await cardPayment(payload);
    } catch (error) {
      // Update order with more details regardless of failed payment
      let orderUpdate = await Order.findById(neworder[0]._id);
      orderUpdate.orderItems = neworder[0].orderItems;
      // orderUpdate.totalPrice = neworder[0].totalPrice;
      // orderUpdate.taxPrice = neworder[0].taxPrice;
      // orderUpdate.subtotal = neworder[0].subtotal;
      orderUpdate.paymentResult = neworder[0].paymentResult;
      orderUpdate.markModified("paymentResult");
      await orderUpdate.save();
      return { err: `${neworder[0].paymentResult.message}...We're unable to process card payments at this time, please try other payment options..`, status: 400 };
    }
  }
  if (neworder[0].paymentMethod === "USSD") {
    try {
      const payload = {
        tx_ref: neworder[0].orderId,
        account_bank: orderParam.bankCode,
        amount: discountCheck ? neworder[0].totalDiscountedPrice : neworder[0].totalPrice,
        currency: "NGN",
        email: neworder[0].user.email,
        phone_number: neworder[0].user.phone_number,
        fullname: `${neworder[0].user.first_name} ${neworder[0].user.last_name}`
      };
      neworder[0].paymentResult = await ussdPayment(payload);
      neworder[0].paymentResult.meta.authorization.ussdBank = orderParam.ussdBank;
    } catch (error) {
      // Update order with more details regardless of failed payment
      let orderUpdate = await Order.findById(neworder[0]._id);
      orderUpdate.orderItems = neworder[0].orderItems;
      // orderUpdate.totalPrice = neworder[0].totalPrice;
      // orderUpdate.taxPrice = neworder[0].taxPrice;
      // orderUpdate.subtotal = neworder[0].subtotal;
      orderUpdate.paymentResult = neworder[0].paymentResult;
      orderUpdate.markModified("paymentResult");
      await orderUpdate.save();
      return { err: `${neworder[0].paymentResult.message}...We're unable to process USSD payments at this time, please try other payment options..`, status: 400 };
    }
  }

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
        "deliveryReview"
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
      from: "deliveries",
      localField: "delivery",
      foreignField: "_id",
      as: "delivery",
    })
    .lookup({
      from: "reviews",
      localField: "rider",
      foreignField: "rider",
      as: "deliveryReview",
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
      delivery: { $arrayElemAt: ["$delivery", 0] },
    })
    .addFields({
      sumOfStars: { $sum: "$deliveryReview.star" },
      numOfReviews: { $size: "$deliveryReview" },
      averageRating: { $floor: { $avg: "$deliveryReview.star" } },
      deliveryCount: { $size: "$deliveryReview" },
    })
    .addFields({
      averageRating: { $ifNull: ["$deliveryReview", 0] },
      rider: { $ifNull: ["$rider", []] },
    })
    .append(pipeline);

  return orderDetails;
};

const editOrder = async (orderID, orderParam) => {
  // can be used by both stores and users
  const order = await Order.findById(orderID);
  if (orderParam.status === "ready" && order.status !== "approved") {
    return { err: "Sorry you can only set an order to ready after it has been approved by a store", status: 400 };
  }
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
    status: "delivered"
  });
  if (!order) return { err: "We couldn't add your feedback at this time. The order may not exist or still in progress, please try again later.", status: 404 };

  // check if user has made any review
  const isReviewed = await Review.findOne({
    order: review.order,
    user: review.user
  });
  if (isReviewed) return { err: "Your review has been submitted for this order already.", status: 409 };

  // add store to review object
  review.store = order.store;

  // save review
  const userReview = new Review(review);
  await userReview.save();

  // change order isReviewed to true
  await Order.findByIdAndUpdate(
    review.order,
    { $set: { isReviewed: true } },
    { omitUndefined: true, new: true, useFindAndModify: false }
  );

  return "Review submitted successfully.";

  // const newReview = await Review.findById(userReview._id).populate("user", "first_name last_name");

  // return newReview;
};

const encryptDetails = async (cardDetails) => {
  // let result = await encryptCard(cardDetails);
  let charge = await encryptCard(cardDetails);
  console.log(charge);
  return charge;
};

const calculateDeliveryFee = async (userId, { storeId, destination, origin }) => {
  const distancePromise = getDistanceServiceForDelivery(destination, origin);

  // find store and populate store's category
  const storePromise = Store.findById(storeId).populate("category");
  const [distance, store] = await Promise.all([distancePromise, storePromise]);
  // if store is not found return error
  if (!store) return { err: "Store not found.", status: 404 };

  // get store's category
  const category = store.category.name;

  // category name can either be "Food" or "Groceries" or "Cosmetics"
  // set base delivery fee for each category
  let baseDeliveryFee = 0;
  if (category === "Food") baseDeliveryFee = 400;
  else if (category === "Groceries") baseDeliveryFee = 800;
  else if (category === "Cosmetics") baseDeliveryFee = 700;

  // convert distance value to km
  distance.distance.value /= 1000;

  // if distance too far
  let tooFar = false;
  if (distance.distance.value > 20) tooFar = true;

  // set distance fee based on distance
  let distanceFee = distance.distance.value * 23;

  // convert distance time to minutes
  distance.duration.value /= 60;

  // set time fee based on time
  let timeFee = distance.duration.value * 10;

  // set delivery fee
  let deliveryFee = baseDeliveryFee + distanceFee + timeFee;

  // check for surge by checking the amount of riders that isBusy is true and false
  let surge = false;
  const busyRidersPromise = Rider.find({
    store: storeId,
    isBusy: true,
    location: {
      $geoWithin: {
        $centerSphere: [[store.location.coordinates[0], store.location.coordinates[1]], 0.0015],
      }
    }
  });

  const otherRidersPromise = Rider.find({
    "location.coordinates": {
      $geoWithin: {
        $centerSphere: [[store.location.coordinates[0], store.location.coordinates[1]], 10000.23456],
      }
    }
  });

  const [busyRiders, otherRiders] = await Promise.all([busyRidersPromise, otherRidersPromise]);

  const busyRidersLength = busyRiders.length;
  const freeRidersLength = otherRiders.length;

  // check if there are more busy riders than free riders different ranges
  if (process.env.NODE_ENV === "production") {
    if (freeRidersLength - busyRidersLength > 0 && freeRidersLength - busyRidersLength < 5) {
      deliveryFee += deliveryFee * 0.15;
      surge = true;
    } else if (freeRidersLength - busyRidersLength > 5 && freeRidersLength - busyRidersLength < 10) {
      deliveryFee += deliveryFee * 0.1;
      surge = true;
    }
  }

  // get users basket
  const userbasketItemsPromise = getUserBasketItems(userId);

  // calculate subtotal fee from userbascket items totalPrice
  // get user Platform fee
  let userPlatFormFeePromise = Userconfig.findOne({
    user: "User",
    userId,
  });
  const [userbasketItems, userPlatFormFee] = await Promise.all([userbasketItemsPromise, userPlatFormFeePromise]);

  let subtotalFee = (userPlatFormFee.fee / 100) * userbasketItems.totalPrice;
  let vatFee = 0.075 * subtotalFee;
  let taxFee = subtotalFee + vatFee;

  // check for deliveryFee userDiscount
  let deliveryDiscountPrice = deliveryFee;
  let deliveryDiscount = false;
  const userDeliveryDiscount = await UserDiscount.findOne({ user: userId, discountType: "deliveryFee" });
  if (userDeliveryDiscount && userDeliveryDiscount.count < userDeliveryDiscount.limit) {
    let discount = userDeliveryDiscount.discount / 100;
    deliveryDiscountPrice = deliveryFee - deliveryFee * discount;
    deliveryDiscount = true;
  }

  // check for taxFee userDiscount
  let taxDiscountPrice = taxFee;
  let taxDiscount = false;
  const userTaxDiscount = await UserDiscount.findOne({ user: userId, discountType: "taxFee" });
  if (userTaxDiscount && userTaxDiscount.count < userTaxDiscount.limit) {
    let discount = userTaxDiscount.discount / 100;
    taxDiscountPrice = subtotalFee - (subtotalFee * discount);
    let newVatFee = 0.075 * taxDiscountPrice;
    taxDiscountPrice += newVatFee;
    taxDiscount = true;
  }

  // check for subtotal userDiscount
  let subtotalDiscountPrice = userbasketItems.totalPrice;
  let subtotalDiscount = false;
  const userSubtotalDiscount = await UserDiscount.findOne({ user: userId, discountType: "subtotal" });
  if (userSubtotalDiscount && userSubtotalDiscount.count < userSubtotalDiscount.limit) {
    let discount = userSubtotalDiscount.discount / 100;
    subtotalDiscountPrice = userbasketItems.totalPrice - userbasketItems.totalPrice * discount;
    if (subtotalDiscountPrice < 500) subtotalDiscountPrice = 500;
    subtotalDiscount = true;
  }

  // return ceiled values for all fees
  return {
    subtotalFee: Math.ceil(userbasketItems.totalPrice),
    deliveryFee: Math.ceil(deliveryFee),
    platformFee: Math.ceil(taxFee),
    distanceFee: Math.ceil(distanceFee),
    timeFee: Math.ceil(timeFee),
    baseDeliveryFee: Math.ceil(baseDeliveryFee),
    surge,
    tooFar,
    busyRiders: busyRidersLength,
    freeRiders: freeRidersLength,
    deliveryDiscount,
    deliveryDiscountPrice: Math.ceil(deliveryDiscountPrice),
    platformFeeDiscount: taxDiscount,
    platformFeeDiscountPrice: Math.ceil(taxDiscountPrice),
    subtotalDiscount,
    subtotalDiscountPrice: Math.ceil(subtotalDiscountPrice),
    totalDiscountedPrice: Math.ceil(deliveryDiscountPrice) + Math.ceil(taxDiscountPrice) + Math.ceil(subtotalDiscountPrice)
  };
};

export {
  getOrders,
  createOrder,
  toggleFavorite,
  getOrderDetails,
  getCartItems,
  editOrder,
  reviewOrder,
  encryptDetails,
  calculateDeliveryFee
};

// Updates
// Make getOrders able to fetch history for both stores and users by adding the parameters in the url query.
// scrap the toggleFavorite, cancel, deliver, edit, receive and complete order functions, operations can be carried out within the editOrder function.
// Get favorites can also be added as a parameter to the getOrders function.
