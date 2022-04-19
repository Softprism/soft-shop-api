import express from "express";
import auth from "../middleware/auth";
import checkPagination from "../middleware/checkPagination";

import {
  getOrders,
  createOrder,
  toggleFavorite,
  getOrderDetails,
  editOrder,
  reviewOrder,
  encryptDetails
} from "../controllers/order.controller";
import validator from "../middleware/validator";
import { order_validation, reviewValidation } from "../validations/orderValidation";
import {
  sendUserNewOrderApprovedMail, sendUserNewOrderRejectedMail, sendUserOrderAcceptedMail, sendUserOrderDeliveredMail, sendUserOrderPickedUpMail, sendUserOrderReadyMail
} from "../utils/sendMail";
import {
  sendUserNewOrderRejectedSMS, sendUserOrderDeliveredSMS, sendUserOrderPickedUpSMS, sendUserNewOrderAcceptedSMS
} from "../utils/sendSMS";
import { sendMany, sendTopic } from "../services/push.service";
import User from "../models/user.model";
import Store from "../models/store.model";
import Order from "../models/order.model";

const router = express.Router();

// @route   GET /
// @desc    Get all orders from all stores.
// @access  Private
router.get("/", auth, checkPagination, getOrders);

// @route   POST /create
// @desc    create a new order
// @access  Private
router.post(
  "/",
  auth,
  validator(order_validation),
  createOrder
);

// @route   PUT /toggle-favorite/:orderID
// @desc    toggles favorite option in a order
// @access  Private
router.patch("/toggle-favorite/:orderID", auth, toggleFavorite);

// @route   PUT /user/edit/
// @desc    modify fields in an order
// @access  Private
router.put(
  "/user/edit/:orderID",
  auth,
  editOrder,
  async (req, res) => {
    let user = await User.findById(req.localData.user_id);
    let store = await Store.findById(req.localData.store_id);
    let order = await Order.findById(req.localData.order_id);
    if (req.body.status === "approved") {
      // send mail
      await sendUserNewOrderApprovedMail(order.orderId, req.localData.user_email, req.localData.store_name);
      // send sms
      await sendUserNewOrderAcceptedSMS(order.orderId, req.localData.user_phone, req.localData.store_name);
      // send push notification
      await sendMany(
        "ssa",
        user.pushDeviceToken,
        `${order.orderId} approved`,
        `Your order has been accepted and is being prepared by ${req.localData.store_name} we'll also notify you when your order is on the way.`
      );
    }
    if (req.body.status === "canceled") {
      // send mail
      await sendUserNewOrderRejectedMail(order.orderId, req.localData.user_email, req.localData.store_name);
      // send sms
      await sendUserNewOrderRejectedSMS(order.orderId, req.localData.user_phone, req.localData.store_name);
      // send push notification
      await sendMany(
        "ssa",
        user.pushDeviceToken,
        `${order.orderId} canceled`,
        `Your order has been rejected by ${req.localData.store_name} you can checkout alternative store near you for the same items.`
      );
    }
    if (req.body.status === "ready") {
      // send mail
      await sendUserOrderReadyMail(order.orderId, req.localData.user_email);
      // await sendUserNewOrderRejectedSMS(req.localData.user_phone, req.localData.store_name);

      // send push notification to user
      await sendMany(
        "ssa",
        user.pushDeviceToken,
        `${order.orderId} ready for pickup`,
        "Your order is now ready for delivery, we'll also notify you when your order has been picked up."
      );

      // // send push notification to riders
      // let data = {
      //   event: "order_ready",
      //   place_id: store.place_id,
      //   coords: store.location.coordinates
      // };
      // await sendTopic(
      //   "ssa",
      //   "riderApp",
      //   "",
      //   "",
      //   data
      // );
    }
    // if (req.body.status === "accepted") {
    //   await sendUserOrderAcceptedMail(order.orderId, req.localData.user_email, req.localData.delivery_address);
    //   // send push notification to user
    //   await sendMany(
    //     "ssa",
    //     user.pushDeviceToken,
    //     `${order.orderId} accepted`,
    //     "Your order has been accepted by a rider and is being prepared by the store."
    //   );
    //   // send mail to store, notify them of rider delivery acceptance
    //   await sendMany(
    //     "ssa",
    //     store.orderPushDeviceToken,
    //     `Delivery for ${order.orderId} accepted`,
    //     `The delivery for your order ${order.orderId} has been accepted by a rider.`
    //   );
    //   // await sendUserNewOrderRejectedSMS(req.localData.user_phone, req.localData.store_name);
    // }
    // if (req.body.status === "enroute") {
    //   await sendUserOrderPickedUpMail(order.orderId, req.localData.user_email, req.localData.delivery_address);
    //   await sendUserOrderPickedUpSMS(order.orderId, req.localData.user_phone, req.localData.delivery_address);
    // }
    // if (req.body.status === "delivered") {
    //   await sendUserOrderDeliveredMail(order.orderId, req.localData.user_email, req.localData.delivery_address);
    //   await sendUserOrderDeliveredSMS(order.orderId, req.localData.user_phone, req.localData.delivery_address);
    // }
    // if (req.body.status === "completed") {
    //   // send push notification to store
    //   let data = {
    //     event: "completed_order",
    //     route: "/",
    //     index: "3"
    //   };
    //   await sendMany(
    //     "ssa",
    //     store.orderPushDeviceToken,
    //     `order ${order.orderId} completed`,
    //     `The rider successfully delivered order ${order.orderId} to your customer.`,
    //     data
    //   );
    // }
  }
);

// @route   PUT /review
// @desc    user adds review to their order
// @access  Private
router.put("/review/:orderId?", auth, validator(reviewValidation), reviewOrder);

// @route   POST /card/encrypt
// @desc
// @access  Private
router.post("/card/encrypt", encryptDetails);

// @route   GET /:orderID
// @desc    toggles an order's detail
// @access  Private
router.get("/:orderID", auth, getOrderDetails);

export default router;
