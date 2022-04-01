import express from "express";
import { check, validationResult } from "express-validator";
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
    if (req.body.status === "approved") {
      await sendUserNewOrderApprovedMail(req.localData.user_email, req.localData.store_name);
      await sendUserNewOrderAcceptedSMS(req.localData.user_phone, req.localData.store_name);
    }
    if (req.body.status === "canceled") {
      await sendUserNewOrderRejectedMail(req.localData.user_email, req.localData.store_name);
      await sendUserNewOrderRejectedSMS(req.localData.user_phone, req.localData.store_name);
    }
    if (req.body.status === "ready") {
      await sendUserOrderReadyMail(req.localData.user_email);
      // await sendUserNewOrderRejectedSMS(req.localData.user_phone, req.localData.store_name);
    }
    if (req.body.status === "accepted") {
      await sendUserOrderAcceptedMail(req.localData.user_email, req.localData.delivery_address);
      // await sendUserNewOrderRejectedSMS(req.localData.user_phone, req.localData.store_name);
    }
    if (req.body.status === "enroute") {
      await sendUserOrderPickedUpMail(req.localData.user_email, req.localData.delivery_address);
      await sendUserOrderPickedUpSMS(req.localData.user_phone, req.localData.delivery_address);
    }
    if (req.body.status === "delivered") {
      await sendUserOrderDeliveredMail(req.localData.user_email, req.localData.delivery_address);
      await sendUserOrderDeliveredSMS(req.localData.user_phone, req.localData.delivery_address);
    }
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
