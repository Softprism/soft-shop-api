/* eslint-disable import/named */
import express from "express";

import auth from "../middleware/auth";
import NotificationController from "../controllers/notification.contoller";
import checkPagination from "../middleware/checkPagination";

const {
  getNotifications, getNotificationById
} = NotificationController;

const router = express.Router();

// @route   GET /notifications
// @desc    Get all notifications
// @access  Private
router.get("/", checkPagination, auth, getNotifications);

// @route   GET /notifications/:id
// @desc    Get a rider notification
// @access  Private
router.get("/:notificationId", auth, getNotificationById);

export default router;
