import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Store from "../models/store.model.js";
import mongoose from "mongoose";
import Review from "../models/review.model.js";

const getOrders = async (urlParams) => {
  try {
    //initialize match parameters, get limit, skip & sort values
    let matchParam = {};
    const limit = Number(urlParams.limit);
    const skip = Number(urlParams.skip);
    let sort = urlParams.sort;

    // check and add to match paramters if request is matching for store, convert string to objectId
    if (urlParams.store)
      matchParam.store = mongoose.Types.ObjectId(urlParams.store);

    // check and add to match paramters if request is matching for user, convert string to objectId
    if (urlParams.user)
      matchParam.user = mongoose.Types.ObjectId(urlParams.user);

    // check and add to match paramters if request is matching for isFavorite
    if (urlParams.isFavorite) matchParam.isFavorite = urlParams.isFavorite;

    // check for sort type
    if (urlParams.sortType == "desc") sort = "-" + sort;
    if (!urlParams.sort) sort = "createdAt";

    // check if request is filtering for minTotalPrice & or maxTotalPrice
    if (urlParams.minTotalPrice) {
      matchParam.totalPrice = {
        $gte: parseInt(urlParams.minTotalPrice),
        $lte: parseInt(urlParams.maxTotalPrice),
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
      .project({
        status: 1,
        totalPrice: 1,
        "orderItems.productName": 1,
        orderId: 1,
        createdAt: 1,
      })
      .append(pipeline)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return orders;
  } catch (error) {
    return { err: "error loading orders" };
  }
};

const createOrder = async (orderParam) => {
  try {
    const { store, user } = orderParam;

    //validate user
    const vUser = await User.findById(user);
    if (!vUser) throw { err: "User not found" };

    //validate store
    const vStore = await Store.findById(store);
    if (!vStore) throw { err: "Store not found" };

    //generates random unique id;
    let orderId = () => {
      let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      };
      //return id of format 'soft - aaaaa'
      return "soft-" + s4();
    };

    //creates an order for user after all validation passes
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
      { _id: neworder[0]._id },
      {
        $set: {
          orderItems: neworder[0].orderItems,
          totalPrice: neworder[0].totalPrice,
          taxPrice: neworder[0].taxPrice,
          subtotal: neworder[0].subtotal,
        },
      },
      { omitUndefined: true, new: true, useFindAndModify: false }
    );

    return neworder[0];
  } catch (err) {
    console.log(err);
    return err;
  }
};

const toggleFavorite = async (orderID) => {
  try {
    //adds or remove users favorite order
    const order = await Order.findById(orderID);

    if (!order) {
      throw { err: "Invalid Order" };
    }

    order.isFavorite = !order.isFavorite;
    order.save();

    if (order.isFavorite) {
      return { msg: "Order marked as favorite" };
    } else {
      return { msg: "Order removed from favorites" };
    }

    // return order;
  } catch (err) {
    return { err: "Error marking order as favorite" };
  }
};

const getOrderDetails = async (orderID) => {
  try {
    const order = await Order.findById(orderID);

    console.log(order);
    if (!order) {
      throw { err: "Error getting this order details" };
    }
    //get users order details
    //can be used by users, stores and admin

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
        from: "customfees",
        localField: "orderItems.product",
        foreignField: "product",
        as: "productFees",
      })
      .addFields({
        customFees: { $sum: "$productFees.amount" },
        user: { $arrayElemAt: ["$user", 0] },
        store: { $arrayElemAt: ["$store", 0] },
      })
      .append(pipeline);

    return orderDetails;
  } catch (err) {
    return err;
  }
};

const editOrder = async (orderID, orderParam) => {
  try {
    //can be used by both stores and users
    await Order.findByIdAndUpdate(
      orderID,
      { $set: orderParam },
      { omitUndefined: true, new: true, useFindAndModify: false }
    );
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
  } catch (error) {
    console.log(error);
    return { err: "error editing this order" };
  }
};

const getCartItems = async (userID) => {
  try {
    //get user cart items
    let user = await User.findById(userID)
      .select("cart")
      .populate("cart.product_id");
    return user;
  } catch (error) {
    return { err: "error getting user cart items" };
  }
};

const reviewOrder = async (review) => {
  try {
    const product = await Order.findById(review.order);

    if (!product) throw { err: "order could not be found" };

    const newReview = new Review(review);
    await newReview.save();

    return newReview;
  } catch (error) {
    return error;
  }
};

export {
  getOrders,
  createOrder,
  toggleFavorite,
  getOrderDetails,
  getCartItems,
  editOrder,
  reviewOrder,
};

// Updates
// Make getOrders able to fetch history for both stores and users by adding the parameters in the url query.
//scrap the toggleFavorite, cancel, deliver, edit, receive and complete order functions, operations can be carried out within the editOrder function.
// Get favorites can also be added as a parameter to the getOrders function.
