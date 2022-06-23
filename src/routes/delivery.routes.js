/* eslint-disable import/named */
import express from "express";

import auth from "../middleware/auth";
import {
  create_Delivery, accept_Delivery, update_DeliveryStatus, complete_Delivery,
  update_RiderStatus, getAll_Deliveries, get_DeliveryById, review_delivery, getPickupTimeCtrl
} from "../controllers/delivery.controller";
import checkPagination from "../middleware/checkPagination";
import { isStoreAdmin } from "../middleware/Permissions";
import Store from "../models/store.model";
import Rider from "../models/rider.model";
import Order from "../models/order.model";

import { sendMany, sendPushToNearbyRiders } from "../services/push.service";
import User from "../models/user.model";
import {
  sendUserNewOrderRejectedMail, sendUserOrderAcceptedMail, sendUserOrderCompletedMail, sendUserOrderDeliveredMail, sendUserOrderReadyMail
} from "../utils/sendMail";
import { sendUserNewOrderRejectedSMS, sendUserOrderDeliveredSMS } from "../utils/sendSMS";
import Delivery from "../models/delivery.model";
import { createLog } from "../services/logs.service";
import { createTransaction } from "../services/transaction.service";
import Logistics from "../models/logistics-company.model";

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
        orderId: order.orderId,
        // add delivery fee minus 3%
        deliveryFee: Number(order.deliveryPrice - Math.round(order.deliveryPrice * 0.04)),
        user: user._id,
        store: store._id
      };
      // create delivery
      newDelivery = await Delivery.create(newDelivery);

      // send push notification to riders
      await sendPushToNearbyRiders(newDelivery, store, user);

      // send push notification to user
      await sendMany(
        "ssa",
        user.pushDeviceToken,
        `${order.orderId} ready for pickup`,
        "Your order is now ready for delivery, we'll also notify you when your order has been picked up."
      );

      // await sendUserOrderReadyMail(order.orderId, user.email);
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
    let order = await Order.findById(req.data.order_id);
    let store = await Store.findById(req.data.store_id);
    let rider = await Rider.findById(req.data.rider_id);
    // update rider isBusy status to true
    rider.isBusy = true;
    await rider.save();

    // update order status
    await Order.findByIdAndUpdate(
      { _id: req.data.order_id },
      { status: "accepted", rider: req.data.rider_id },
      { new: true }
    );
    // send push notification to user
    await sendMany(
      "ssa",
      user.pushDeviceToken,
      `${order.orderId} accepted`,
      "Your order has been accepted by a rider and is being prepared by the store."
    );
    // send mail to store, notify them of rider delivery acceptance
    await sendMany(
      "ssa",
      store.orderPushDeviceToken,
      `Delivery for ${order.orderId} accepted`,
      `The delivery for your order has been accepted by ${rider.last_name} ${rider.first_name}.`
    );
    // send mail to user, notify them of delivery acceptance
    // await sendUserOrderAcceptedMail(order.orderId, user.email);
  }
);

// @route   PATCH /complete/:orderId
// @desc    User complete delivery
// @access  Private
router.patch(
  "/complete/:orderId",
  auth,
  complete_Delivery,
  async (req, res) => {
    let user = await User.findById(req.localData.user);
    let store = await Store.findById(req.localData.store);
    let rider = await Rider.findById(req.localData.rider);
    let order = await Order.findById(req.localData.order);
    let delivery = await Delivery.findOne({ order: order._id });

    // calculate delivery fee, order fee and store fee
    let deliveryFee = 0.04 * order.deliveryPrice;
    let orderFee = 0.03 * order.subtotal;
    let storeFee = 0.05 * order.subtotal;

    // console log fees
    console.log(`deliveryFee: ${deliveryFee}`);
    console.log(`orderFee: ${orderFee}`);
    console.log(`storeFee: ${storeFee}`);

    // update rider isBusy status to false
    rider.isBusy = false;
    await rider.save();

    // check if rider belongs to a company

    if (rider.corporate) {
      // get rider logistics company
      let company = await Logistics.findById(rider.company_id);

      // create credit transaction for logistics company
      await createTransaction({
        amount: Number(delivery.deliveryFee),
        type: "Credit",
        to: "logistics",
        receiver: company._id,
        status: "completed",
        ref: delivery.orderId,
        fee: deliveryFee
      });
    } else {
      // create credit transaction for rider
      await createTransaction(
        {
          amount: Number(delivery.deliveryFee),
          type: "Credit",
          to: "Rider",
          receiver: rider._id,
          status: "completed",
          ref: delivery.orderId,
          fee: deliveryFee
        }
      );
    }

    // create credit transaction for store
    await createTransaction(
      {
        amount: Number(order.subtotal - storeFee),
        type: "Credit",
        to: "Store",
        receiver: store._id,
        status: "completed",
        ref: delivery.orderId,
        fee: storeFee
      }
    );

    // create credit transaction for ledger
    await createTransaction(
      {
        amount: orderFee + storeFee + deliveryFee,
        type: "Credit",
        to: "Ledger",
        receiver: delivery._id,
        status: "completed",
        ref: delivery.orderId,
        fee: 0
      }
    );

    // send push notification to user
    await sendMany(
      "ssa",
      user.pushDeviceToken,
      `Order - ${order.orderId} completed`,
      "Your order has been delivered and completed, please rate your experience shopping from this store."
    );
    // send mail to store, notify them of rider delivery acceptance
    let data = {
      event: "completed_order",
      route: "/",
      index: "3"
    };
    await sendMany(
      "ssa",
      store.orderPushDeviceToken,
      `Order -  ${order.orderId} completed`,
      `${rider.last_name} ${rider.first_name} completed the delivery to your customer successfully.`,
      data
    );
    // send mail to user, notify them of order completd
    await sendUserOrderCompletedMail(order.orderId, user.email);
  }
);

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

    if (req.query.status === "failed") {
      order.status = "cancelled";
      await order.save();

      // send push notification to store
      await sendMany(
        "ssa",
        store.orderPushDeviceToken,
        `Delivery for ${order.orderId} failed`,
        `The delivery for ${order.orderId} has failed.`
      );
      // send mail
      await sendUserNewOrderRejectedMail(order.orderId, user.email, store.name);
      // send sms
      await sendUserNewOrderRejectedSMS(order.orderId, user.phone_number, store.name);
      // send push notification to user
      await sendMany(
        "ssa",
        user.pushDeviceToken,
        `${order.orderId} canceled`,
        `Your order has been rejected by ${rider.last_name} ${rider.first_name} you can checkout alternative store near you for the same items.`
      );
    }
    if (req.query.status === "delivered") {
      // change order status to delivered
      order.status = "arrived";
      await order.save();

      await sendMany(
        "ssa",
        user.pushDeviceToken,
        `${rider.last_name} ${rider.first_name} has Arrived`,
        "Your order has been delivered to your location."
      );
      // send mail to user
      // await sendUserOrderDeliveredMail(order.orderId, user.email, order.deliveryAddress);
      // send sms to user
      await sendUserOrderDeliveredSMS(order.orderId, user.phone_number, order.deliveryAddress);
    }
    if (req.query.status === "accepted") {
      // change order status to accepted
      order.status = "accepted";
      await order.save();

      // send push notification to user notify them of rider delivery acceptance
      await sendMany(
        "ssa",
        user.pushDeviceToken,
        `Delivery for ${order.orderId} accepted`,
        `The delivery for your order has been accepted by ${rider.last_name} ${rider.first_name}.`
      );
      // send mail to store, notify them of rider delivery acceptance
      await sendMany(
        "ssa",
        store.orderPushDeviceToken,
        `Delivery for ${order.orderId} accepted`,
        `The delivery for your order has been accepted by ${rider.last_name} ${rider.first_name}.`
      );
      // send mail to user
      // await sendUserOrderAcceptedMail(order.orderId, user.email, order.delivery_address);
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

    if (req.query.status === "Arrive at pickup") {
      await sendMany(
        "ssa",
        user.pushDeviceToken,
        `Your Rider At ${store.name}`,
        `${rider.last_name} ${rider.first_name} is at ${store.name} receiving your order.`
      );
      let data = {
        event: "pickup_order",
        route: "/",
        index: "3"
      };
      await sendMany(
        "ssa",
        store.orderPushDeviceToken,
        `${rider.last_name} ${rider.first_name} is waiting!`,
        `${rider.last_name} ${rider.first_name} is at your location waiting to pickup ${order.orderId}`,
        data
      );
    }
    if (req.query.status === "Start Delivery") {
      // change order status to enroute
      order.status = "enroute";
      await order.save();

      await sendMany(
        "ssa",
        user.pushDeviceToken,
        `Order ${order.orderId} is enroute`,
        `Your order ${order.orderId} has been picked up for delivery, please be available at ${order.deliveryAddress}`
      );
    }
    if (req.query.status === "Complete Drop off") {
      // await sendMany(
      //   "ssa",
      //   store.orderPushDeviceToken,
      //   `Delivery for ${order.orderId} completed`,
      //   "The delivery for your order has been completed."
      // );
      // change order status to delivered
      order.status = "arrived";
      await order.save();

      // change rider isBusy status to false
      rider.isBusy = false;
      await rider.save();

      await sendMany(
        "ssa",
        user.pushDeviceToken,
        `${rider.last_name} ${rider.first_name} has Arrived`,
        "Your order has been delivered to your location."
      );
    }
    if (req.query.status === "cancelled") {
      // change order status to cancelled
      order.status = "cancelled";
      await order.save();

      // change rider isBusy status to false
      rider.isBusy = false;
      await rider.save();

      // send push notification to store
      await sendMany(
        "ssa",
        store.orderPushDeviceToken,
        `Delivery for ${order.orderId} canceled`,
        "The delivery for your order has been canceled."
      );

      // send push notification to user
      await sendMany(
        "ssa",
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
router.get("/pickup/:deliveryId", auth, getPickupTimeCtrl);

// @route   GET /deliveries/:deliveryId
// @desc    Get rider delivery by id
// @access  Private
router.get("/arrival/:deliveryId", auth, getPickupTimeCtrl);

// @route   GET /deliveries/:deliveryId
// @desc    Get rider delivery by id
// @access  Private
router.get("/:deliveryId", auth, get_DeliveryById);

export default router;
