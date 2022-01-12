import express from "express";
import validator from "../middleware/validator";
import auth from "../middleware/auth";
import {
  getNotifications, getNotificationById
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

export default router;
