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
  verifyOrderPayment
} from "../controllers/order.controller";
import { acknowledgeFlwWebhook } from "../middleware/payment";

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
  [
    check("product_meta", "error with product data ").isLength({ min: 1 }),
    check("store", "Please select a store").not().isEmpty(),
  ],
  createOrder
);

// @route   PUT /toggle-favorite/:orderID
// @desc    toggles favorite option in a order
// @access  Private
router.patch("/toggle-favorite/:orderID", auth, toggleFavorite);

// @route   PUT /user/edit/
// @desc    modify fields in an order
// @access  Private
router.put("/user/edit/:orderID", auth, editOrder);

// @route   PUT /review
// @desc    user adds review to their order
// @access  Private
router.put("/review/:orderId?", auth, reviewOrder);

// @route   PUT /review
// @desc    user adds review to their order
// @access  Private
router.post("/payment/verify", acknowledgeFlwWebhook, verifyOrderPayment);

// @route   GET /:orderID
// @desc    toggles an order's detail
// @access  Private
router.get("/:orderID", auth, getOrderDetails);

export default router;
