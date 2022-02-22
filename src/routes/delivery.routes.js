/* eslint-disable import/named */
import express from "express";

import auth from "../middleware/auth";
import {
  create_Delivery, accept_Delivery, update_DeliveryStatus, complete_Delivery,
  update_RiderStatus, getAll_Deliveries, get_DeliveryById, review_delivery
} from "../controllers/delivery.controller";
import checkPagination from "../middleware/checkPagination";
import { isStoreAdmin } from "../middleware/Permissions";

const router = express.Router();

// @route   POST /stores/orders/delivery
// @desc    Create delivery
// @access  Private
router.post("/:orderId", auth, isStoreAdmin, create_Delivery);

// @route   PATCH /accept/:deliveryId
// @desc    Rider accept delivery
// @access  Private
router.patch("/accept/:deliveryId", auth, accept_Delivery);

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
router.patch("/delivery-status/:deliveryId", auth, update_DeliveryStatus);

// @route   PATCH /rider-status/:deliveryId
// @desc    update rider delivery status
// @access  Private
router.patch("/rider-status/:deliveryId", auth, update_RiderStatus);

// @route   GET /deliveries
// @desc    Get all rider deliveries
// @access  Private
router.get("/", checkPagination, auth, getAll_Deliveries);

// @route   GET /deliveries/:deliveryId
// @desc    Get rider delivery by id
// @access  Private
router.get("/:deliveryId", auth, get_DeliveryById);

export default router;
