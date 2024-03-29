/* eslint-disable import/named */
import express from "express";

import { create } from "handlebars";
import auth from "../middleware/auth";
import {
  create_Delivery, accept_Delivery, update_DeliveryStatus, complete_Delivery,
  update_RiderStatus, getAll_Deliveries, get_DeliveryById, review_delivery, getPickupTimeCtrl, getDeliveryTimeCtrl
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
import { createVat } from "../services/vat.service";
import Userconfig from "../models/configurations.model";
import Ledger from "../models/ledger.model";
import UserDiscount from "../models/user-discount.model";
import Referral from "../models/referral.model";
import { addUserDiscount } from "../services/admin.service";

const router = express.Router();
let startTime = performance.now(); // Run at the beginning of the code
function executingAt() {
  return (performance.now() - startTime) / 1000;
}

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
        deliveryFee: Number(order.deliveryPrice),
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
    console.log(`Starting operation at ${executingAt()}`);
    let userPromise = User.findById(req.localData.user);
    let storePromise = Store.findById(req.localData.store);
    let riderPromise = Rider.findById(req.localData.rider);
    let orderPromise = Order.findById(req.localData.order);
    let deliveryPromise = Delivery.findOne({ order: req.localData.order });
    let ledgerPromise = Ledger.findOne({});

    // calculate delivery fee, order fee and store fee
    // get rider's platform fee
    let riderDeliveryFeePromise = Userconfig.findOne({
      user: "Rider",
      userId: req.localData.rider,
    });

    // get store platform fee
    let storePlatformFeePromise = Userconfig.findOne({
      user: "Store",
      userId: req.localData.rider,
    });
    let [user, store, rider, order, delivery, ledger, riderDeliveryFee, storePlatformFee] = await Promise.all([userPromise, storePromise, riderPromise, orderPromise, deliveryPromise, ledgerPromise, riderDeliveryFeePromise, storePlatformFeePromise]);

    if (!riderDeliveryFee) {
      riderDeliveryFee = { fee: 10 };
    }
    if (!storePlatformFee) {
      storePlatformFee = { fee: 15 };
    }

    let deliveryFee = (riderDeliveryFee.fee / 100) * order.deliveryPrice;

    let discountCheck2 = order.platformFeeDiscount === true && order.platformFeeDiscountPrice > 0;
    let orderFee = discountCheck2 ? order.platformFeeDiscountPrice : order.taxPrice;
    let storeFee = (storePlatformFee.fee / 100) * order.subtotal;

    // calculate VAT for paying parties
    let deliveryTax = 0.075 * deliveryFee;
    let orderTax = 0.075 * orderFee;
    let storeTax = 0.075 * storeFee;

    // update rider isBusy status to false
    // rider.isBusy = false;
    // await rider.save();

    // check if rider belongs to a company

    if (rider.corporate) {
      // get rider logistics company
      let company = await Logistics.findById(rider.company_id);

      // create credit transaction and VAT log for logistics company
      let corpTrnxPromise = createTransaction({
        amount: Number(delivery.deliveryFee - deliveryTax - deliveryFee),
        type: "Credit",
        to: "logistics",
        receiver: company._id,
        status: "completed",
        ref: delivery.orderId,
        fee: deliveryFee + deliveryFee
      });

      let crvPromise = createVat(
        deliveryFee, deliveryTax, req.localData.order, "Delivery Partner"
      );
      await Promise.all([corpTrnxPromise, crvPromise]);
    } else {
      // create credit transaction and VAT log for rider
      await createTransaction(
        {
          amount: Number(delivery.deliveryFee - deliveryTax - deliveryFee),
          type: "Credit",
          to: "Rider",
          receiver: rider._id,
          status: "completed",
          ref: delivery.orderId,
          fee: deliveryFee + deliveryTax
        }
      );
    }

    let crVatDeliveryPromise1 = createVat(
      deliveryFee, deliveryTax, req.localData.order, "Delivery Partner"
    );

    // create credit transaction for store
    let storeCredTrnxPromise = createTransaction(
      {
        amount: Number(order.subtotal - storeFee - storeTax),
        type: "Credit",
        to: "Store",
        receiver: store._id,
        status: "completed",
        ref: delivery.orderId,
        fee: storeFee + storeTax
      }
    );

    let crvStorePromise = createVat(
      storeFee, storeTax, req.localData.order, "Vendor"
    );

    // create VAT log for users
    let crvUserPromise = createVat(
      orderFee, orderTax, req.localData.order, "Customer"
    );

    // create credit transaction for ledger
    let discountCheck = order.totalDiscountedPrice > 0;
    let ordTotalPrice = discountCheck ? order.totalDiscountedPrice : order.totalPrice;
    let crvLedgerPromise1 = createTransaction(
      {
        amount: ordTotalPrice,
        type: "Credit",
        to: "Ledger",
        receiver: ledger._id,
        status: "completed",
        ref: `Total order price for order: ${delivery.orderId}`,
        fee: 0
      }
    );

    let crvLedgerPromise2 = createTransaction(
      {
        amount: orderFee + storeFee + deliveryFee,
        type: "Credit",
        to: "Ledger",
        receiver: ledger._id,
        status: "completed",
        ref: `Total Fees accrued order: ${delivery.orderId}`,
        fee: 0
      }
    );

    let crvLedgerPromise3 = createTransaction(
      {
        amount: storeTax + deliveryTax + ordTotalPrice,
        type: "Credit",
        to: "Ledger",
        receiver: ledger._id,
        status: "completed",
        ref: `Tax accrued from order: ${delivery.orderId}`,
        fee: 0
      }
    );
    // remove vat from ledger
    let vatDevitTrnxPromise = createTransaction(
      {
        amount: orderTax + storeTax + deliveryTax,
        type: "Debit",
        to: "Ledger",
        receiver: ledger._id,
        status: "completed",
        ref: `tax for ${order.orderId}`,
        fee: 0
      }
    );

    // send push notification to user
    let userPushPromise = sendMany(
      "ssa",
      user.pushDeviceToken,
      `Order - ${order.orderId} completed`,
      "Your order has been delivered and completed, please rate your experience shopping from this store."
    );
    // send mail to store, notify them of rider delivery completion
    let data = {
      event: "completed_order",
      route: "/",
      index: "3"
    };
    // send push notification to store
    let storePushPromise = sendMany(
      "ssa",
      store.orderPushDeviceToken,
      `Order -  ${order.orderId} completed`,
      `${rider.last_name} ${rider.first_name} completed the delivery to your customer successfully.`,
      data
    );
    // send mail to user, notify them of order completd
    let userEmailPromise = sendUserOrderCompletedMail(order.orderId, user.email);

    await Promise.all([crVatDeliveryPromise1, storeCredTrnxPromise, crvStorePromise, crvUserPromise, crvLedgerPromise1, crvLedgerPromise2, crvLedgerPromise3, vatDevitTrnxPromise, userPushPromise, storePushPromise, userEmailPromise]);
    console.log(`ending operation 2 at ${executingAt()}`);

    // check order for discount
    if (order.deliveryDiscount === true || order.platformFeeDiscount === true || order.subtotalDiscount === true) {
      if (order.deliveryDiscount === true && order.deliveryDiscountPrice > 0) {
        // get amount softshop would pay for
        await createTransaction(
          {
            amount: order.deliveryPrice - order.deliveryDiscountPrice,
            type: "Debit",
            to: "Ledger",
            receiver: ledger._id,
            status: "completed",
            ref: `delivery discount - ${order.orderId}`,
            fee: 0
          }
        );
        // find delivery discount
        let deliveryDiscount = await UserDiscount.findOne({ user: user._id, discountType: "deliveryFee" });
        // increment count
        deliveryDiscount.count += 1;
        await deliveryDiscount.save();
      }
      if (order.platformFeeDiscount === true && order.platformFeeDiscountPrice > 0) {
        await createTransaction(
          {
            amount: Number(order.taxPrice - order.platformFeeDiscountPrice),
            type: "Debit",
            to: "Ledger",
            receiver: ledger._id,
            status: "completed",
            ref: `platform fee discount - ${order.orderId}`,
            fee: 0
          }
        );
        // find platformFee discount
        let platformFeeDiscount = await UserDiscount.findOne({ user: user._id, discountType: "taxFee" });
        // increment count
        platformFeeDiscount.count += 1;
        await platformFeeDiscount.save();
      }
      if (order.subtotalDiscount === true && order.subtotalDiscountPrice > 0) {
        await createTransaction(
          {
            amount: Number(order.subtotal - order.subtotalDiscountPrice),
            type: "Debit",
            to: "Ledger",
            receiver: ledger._id,
            status: "completed",
            ref: `product price discount - ${order.orderId}`,
            fee: 0
          }
        );
        // find subtotalFee discount
        let subtotalFeeDiscount = await UserDiscount.findOne({ user: user._id, discountType: "subtotal" });
        // increment count
        subtotalFeeDiscount.count += 1;
        await subtotalFeeDiscount.save();
      }
    }
    // check if it's first order
    let firstOrder = await Order.find({ user: req.localData.user, status: "delivered" });
    if (firstOrder.length === 1) {
      // credit referee's bonus
      // find referee
      // consumers are not worthy of 300 bonus when they get pass 10 referrals
      let referee = await Referral.findOne({ referral_id: user.referee });
      console.log(referee);
      let refereeUserId = await User.findOne({ referral_id: referee.referral_id });
      if (referee) {
        // add 300 naira to referee's balance
        if (referee.isConsumer === true && referee.reffered.length < 10) {
          console.log("true asf");
          await createTransaction(
            {
              amount: 300,
              type: "Credit",
              to: "User",
              receiver: refereeUserId._id,
              status: "completed",
              ref: `Your referral completed their first order - ${delivery.orderId}`,
              fee: 0
            }
          );
          // add discount to referee
          if (refereeUserId) {
            // check for existing discount
            let existingDiscount = await UserDiscount.findOne({ user: refereeUserId._id, discountType: "subtotal" });
            if (existingDiscount && existingDiscount.count < existingDiscount.limit) {
              // check if discount is still less than 50%
              if (existingDiscount.discount < 50) {
                existingDiscount.discount += 5;
                await existingDiscount.save();
              }
            } else {
              await addUserDiscount({
                userId: refereeUserId._id,
                discount: 5,
                discountType: "subtotal",
              });
            }
          }
        }
        if (referee.isConsumer === false) {
          await createTransaction(
            {
              amount: 300,
              type: "Credit",
              to: "User",
              receiver: refereeUserId._id,
              status: "completed",
              ref: `Your referral completed their first order - ${delivery.orderId}`,
              fee: 0
            }
          );
          // add discount to referee
          if (refereeUserId) {
            // check for existing discount
            let existingDiscount = await UserDiscount.findOne({ user: refereeUserId._id, discountType: "subtotal" });
            if (existingDiscount && existingDiscount.count < existingDiscount.limit) {
              // check if discount is still less than 50%
              if (existingDiscount.discount < 50) {
                existingDiscount.discount += 5;
                await existingDiscount.save();
              }
            } else {
              await addUserDiscount({
                userId: refereeUserId._id,
                discount: 5,
                discountType: "subtotal",
              });
            }
          }
        }
      }
    }

    console.log(`ending operation 3 at ${executingAt()}`);
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
      // order.status = "arrived";
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
router.get("/arrival/:deliveryId", auth, getDeliveryTimeCtrl);

// @route   GET /deliveries/:deliveryId
// @desc    Get rider delivery by id
// @access  Private
router.get("/:deliveryId", auth, get_DeliveryById);

export default router;
