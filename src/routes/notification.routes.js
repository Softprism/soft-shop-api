import express from "express";
import validator from "../middleware/validator";
import auth from "../middleware/auth";
import {
  getNotifications, getNotificationById, delete_Rider_Notification_ById, delete_Rider_Notifications
} from "../controllers/notification.contoller";
import checkPagination from "../middleware/checkPagination";
import notificationValidation from "../validations/notificationValidation";

const router = express.Router();

// @route   GET /notifications
// @desc    Get all notifications
// @access  Private
router.get("/", checkPagination, auth, getNotifications);

// @route   GET /notifications/:id
// @desc    Get a rider notification
// @access  Private
router.get("/:notificationId", auth, validator(notificationValidation), getNotificationById);

// @route   DELETE /notifications
// @desc    DELETES all rider notification
// @access  Private
router.delete("/", auth, delete_Rider_Notifications);

// @route   DELETE /notifications/:id
// @desc    DELETE a rider notification
// @access  Private
router.delete("/:notificationId", auth, validator(notificationValidation), delete_Rider_Notification_ById);

export default router;
