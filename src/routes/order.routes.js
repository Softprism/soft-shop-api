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
import { sendUserNewOrderAcceptedMail, sendUserNewOrderRejectedMail } from "../utils/sendMail";
import { sendUserNewOrderRejectedSMS } from "../utils/sendSMS";

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
    if (req.body.status === "accepted") {
      await sendUserNewOrderAcceptedMail(req.localData.user_email, req.localData.store_name);
      await sendUserNewOrderRejectedSMS(req.localData.user_phone, req.localData.store_name);
    }
    if (req.body.status === "canceled") {
      await sendUserNewOrderRejectedMail(req.localData.user_email, req.localData.store_name);
      await sendUserNewOrderRejectedSMS(req.localData.user_phone, req.localData.store_name);
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
