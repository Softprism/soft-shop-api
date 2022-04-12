/* eslint-disable import/named */
import express from "express";

import auth from "../middleware/auth";
import {
  create_Delivery, accept_Delivery, update_DeliveryStatus, complete_Delivery,
  update_RiderStatus, getAll_Deliveries, get_DeliveryById, review_delivery
} from "../controllers/delivery.controller";
import checkPagination from "../middleware/checkPagination";
import { isStoreAdmin } from "../middleware/Permissions";
import Store from "../models/store.model";
import Rider from "../models/rider.model";
import Order from "../models/order.model";

import { sendOne, sendPushToNearbyRiders } from "../services/push.service";
import User from "../models/user.model";
import {
  sendUserNewOrderRejectedMail, sendUserOrderAcceptedMail, sendUserOrderDeliveredMail, sendUserOrderReadyMail
} from "../utils/sendMail";
import { sendUserNewOrderRejectedSMS, sendUserOrderDeliveredSMS } from "../utils/sendSMS";
import Delivery from "../models/delivery.model";
import { createLog } from "../services/logs.service";

const router = express.Router();

// @route   POST /stores/orders/delivery
// @desc    Create delivery
// @access  Private
router.post(
  "/:orderId",
  auth,
  isStoreAdmin,
  create_Delivery,
  async (req, res) => {
    try {
      let order = await Order.findById(req.params.orderId);
      let store = await Store.findById(order.store);
      let user = await User.findById(order.user);

      const {
        orderItems, deliveryAddress,
      } = order;
      let items = [];
      // create item name and quantity
      items = orderItems.map((orderItem) => {
        return `${orderItem.qty}X ${orderItem.productName}`;
      });

      // new delivery object to be created
      let newDelivery = {
        item: items.toString(),
        pickup: store.address,
        location: store.location,
        dropOff: deliveryAddress,
        receiver: `${user.first_name} ${user.last_name}`,
        phone_number: user.phone_number,
        order: order._id,
        user: user._id,
        store: store._id
      };
      // create delivery
      newDelivery = await Delivery.create(newDelivery);

      // send push notification to riders
      await sendPushToNearbyRiders(newDelivery);

      // send push notification to user
      await sendOne(
        "ssu",
        user.pushDeivceToken,
        `${order.orderId} ready for pickup`,
        "Your order is now ready for delivery, we'll also notify you when your order has been picked up."
      );

      await sendUserOrderReadyMail(order.orderId, user.email);
    } catch (error) {
      await createLog("error", "delivery.routes", "create_Delivery");
    }
  }
);

// @route   PATCH /accept/:deliveryId
// @desc    Rider accept delivery
// @access  Private
router.patch(
  "/accept/:deliveryId",
  auth,
  accept_Delivery,
  async (req, res) => {
    let user = await User.findById(req.data.user_id);
    let order = await Order.findById(req.data.orderId);
    let store = await Store.findById(req.data.store_id);
    let rider = await Rider.findById(req.data.rider_id);
    // update order status
    await Order.findByIdAndUpdate(
      { _id: req.data.orderId },
      { status: "accepted", rider: req.data.rider_id },
      { new: true }
    );
    // send push notification to user
    await sendOne(
      "ssu",
      user.pushDeivceToken,
      `${order.orderId} accepted`,
      "Your order has been accepted by a rider and is being prepared by the store."
    );
    // send mail to store, notify them of rider delivery acceptance
    await sendOne(
      "sso",
      store.orderPushDeviceToken,
      `Delivery for ${order.orderId} accepted`,
      `The delivery for your order has been accepted by ${rider.last_name} ${rider.first_name}.`
    );
    // send mail to user, notify them of delivery acceptance
    await sendUserOrderAcceptedMail(order.orderId, user.email);
  }
);

// @route   PATCH /complete/:orderId
// @desc    User complete delivery
// @access  Private
router.patch("/complete/:orderId", auth, complete_Delivery);

// @route   PUT /review
// @desc    user adds review to their order
// @access  Private
router.post("/review/:deliveryId?", auth, review_delivery);

// @route   PATCH delivery-status/:deliveryId
// @desc    Update delivery status
// @access  Private
router.patch(
  "/delivery-status/:deliveryId",
  auth,
  update_DeliveryStatus,
  async (req, res, next) => {
    let store = await Store.findById(req.localData.store_id);
    let order = await Order.findById(req.localData.order_id);
    let user = await User.findById(req.localData.user_id);
    let rider = await Rider.findById(req.localData.rider_id);

    if (req.params.status === "failed") {
      await Order.findByIdAndUpdate({ _id: order._id }, { status: "cancelled" }, { new: true });

      // send push notification to store
      await sendOne(
        "sso",
        store.orderPushDeviceToken,
        `Delivery for ${order.orderId} failed`,
        "The delivery for your order has failed."
      );
      // send mail
      await sendUserNewOrderRejectedMail(order.orderId, user.email, store.name);
      // send sms
      await sendUserNewOrderRejectedSMS(order.orderId, user.phone_number, store.name);
      // send push notification to user
      await sendOne(
        "ssu",
        user.pushDeivceToken,
        `${order.orderId} canceled`,
        `Your order has been rejected by ${rider.last_name} ${rider.first_name} you can checkout alternative store near you for the same items.`
      );
    }
    if (req.params.status === "delivered") {
      await Order.findByIdAndUpdate({ _id: order._id }, { status: "delivered" }, { new: true });

      // send push notification to store
      let data = {
        route: "history"
      };
      await sendOne(
        "sso",
        store.orderPushDeviceToken,
        `Delivery for ${order.orderId} completed`,
        "The delivery for your order has been completed.",
        data
      );
      await sendOne(
        "ssu",
        user.pushDeviceToken,
        `Delivery for ${order.orderId} completed`,
        "The delivery for your order has been completed."
      );
      // send mail to user
      await sendUserOrderDeliveredMail(order.orderId, user.email, order.deliveryAddress);
      // send sms to user
      await sendUserOrderDeliveredSMS(order.orderId, user.phone_number, order.deliveryAddress);
    }
    if (req.params.status === "accepted") {
      await Order.findByIdAndUpdate({ _id: req.localData.order_id }, { status: "accepted" }, { new: true });
      // send push notification to user notify them of rider delivery acceptance
      await sendOne(
        "ssu",
        user.pushDeviceToken,
        `Delivery for ${order.orderId} accepted`,
        `The delivery for your order has been accepted by ${rider.last_name} ${rider.first_name}.`
      );
      // send mail to store, notify them of rider delivery acceptance
      await sendOne(
        "sso",
        store.orderPushDeviceToken,
        `Delivery for ${order.orderId} accepted`,
        `The delivery for your order has been accepted by ${rider.last_name} ${rider.first_name}.`
      );
      // send mail to user
      await sendUserOrderAcceptedMail(order.orderId, user.email, order.delivery_address);
    }
  }
);

// @route   PATCH /rider-status/:deliveryId
// @desc    update rider delivery status
// @access  Private
router.patch(
  "/rider-status/:deliveryId",
  auth,
  update_RiderStatus,
  async (req, res, next) => {
    let store = await Store.findById(req.localData.store_id);
    let rider = await Rider.findById(req.localData.rider_id);
    let order = await Order.findById(req.localData.order_id);
    let user = await User.findById(req.localData.user_id);

    if (req.params.status === "Arrive at pickup") {
      await sendOne(
        "ssu",
        user.pushDeviceToken,
        `Your Rider At ${store.name}`,
        `${rider.last_name} ${rider.first_name} is at ${store.name} receiving your order.`
      );
      await sendOne(
        "sso",
        store.orderPushDeviceToken,
        `${rider.last_name} ${rider.first_name} is waiting!`,
        `${rider.last_name} ${rider.first_name} is at waiting to pickup ${order.orderId}`
      );
    }
    if (req.params.status === "Start Delivery") {
      await sendOne(
        "ssu",
        user.pushDeviceToken,
        `Order ${order.orderId} has been picked up`,
        `Your order ${order.orderId} has been picked up for delivery, please be available at ${order.deliveryAddress}`
      );
    }
    if (req.params.status === "Complete Drop off") {
      await sendOne(
        "sso",
        store.orderPushDeviceToken,
        `Delivery for ${order.orderId} completed`,
        "The delivery for your order has been completed."
      );
      await sendOne(
        "ssu",
        user.pushDeviceToken,
        `Delivery for ${order.orderId} completed`,
        "The delivery for your order has been completed."
      );
    }
    if (req.params.status === "Cancelled") {
      await sendOne(
        "sso",
        store.orderPushDeviceToken,
        `Delivery for ${order.orderId} canceled`,
        "The delivery for your order has been canceled."
      );
      await sendOne(
        "ssu",
        user.pushDeviceToken,
        `Delivery for ${order.orderId} canceled`,
        "The delivery for your order has been canceled."
      );
    }
  }
);

// @route   GET /deliveries
// @desc    Get all rider deliveries
// @access  Private
router.get("/", checkPagination, auth, getAll_Deliveries);

// @route   GET /deliveries/:deliveryId
// @desc    Get rider delivery by id
// @access  Private
router.get("/:deliveryId", auth, get_DeliveryById);

export default router;
