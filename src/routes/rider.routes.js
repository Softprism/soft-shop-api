import express from "express";
import {
  getRiders, verifyToken, signup, signin, getLoggedInRider, requestToken, forgotPassword, createNewPassword, updateRiderProfile, requestPayoutCtrl, getPayoutHistoryCtrl, updateRiderAccountDetailsCtrl, deleteAccountCtrl
} from "../controllers/rider.controller";
import auth from "../middleware/auth";
import validator from "../middleware/validator";
import checkPagination from "../middleware/checkPagination";
import {
  registerValidation, emailValidation, tokenValidation,
  resetValidation, loginValidation, updateRiderValidation
} from "../validations/riderValidation";
import { hashPassword } from "../middleware/validationMiddleware";
import Rider from "../models/rider.model";
import { createLog } from "../services/logs.service";
import { sendPlainEmail, sendSignUpOTPmail } from "../utils/sendMail";

const router = express.Router();

// @route   GET /riders
// @desc    Get all riders
// @access  Public
router.get("/", checkPagination, getRiders);

// @route   GET /user/login
// @desc    Get logged in rider
// @access  Private

router.get("/login", auth, getLoggedInRider);

// @route   POST /riders/verify
// @desc    send OTP to verify new rider signup email
// @access  Public
router.post("/token",
  validator(emailValidation),
  requestToken,
  async (req, res) => {
    await sendSignUpOTPmail(req.data.email, req.data.otp);
  });

// @route   GET /riders/token
// @desc    validates a token
// @access  Public
router.post("/verify", validator(tokenValidation), verifyToken);

// @route   POST /riders/register
// @desc    Register a rider
// @access  Public
router.post("/register",
  hashPassword,
  validator(registerValidation),
  signup,
  async (req, res) => {
    if (process.env.NODE_ENV === "production") {
      // find rider by id
      let rider = await Rider.findById(req.data.riderId);
      // create log
      await createLog("new rider signup", "rider", `A new signup from ${rider.last_name} ${rider.first_name} with email - ${rider.email}`);
      await sendPlainEmail(
        "logs@soft-shop.app",
        "A new rider has signed up",
        `A new rider has signed up with email: ${rider.email}`,
      );
    }
  });

// @route   POST /riders/login
// @desc    Login a User & get token
// @access  Public
router.post("/signin",
  validator(loginValidation),
  signin,
  async (req, res) => {
    // device token registration
    let rider = await Rider.findById(req.data.id);
    if (req.body.pushDeviceToken) {
      let existingToken = rider.pushDeviceToken.find((res) => {
        return res === req.body.pushDeviceToken;
      });
      if (!existingToken) {
        rider.pushDeviceToken.push(req.body.pushDeviceToken);
        await rider.save();
      }
    }

    // create log
    await createLog("rider Login", "rider", `A new login from ${rider.last_name} ${rider.first_name} with email - ${req.body.email}`);
  });

// @route   POST /password
// @desc    reset a forget password
// @access  Public
router.post("/forgot-password", validator(emailValidation), forgotPassword);

// @route   PATCH /password
// @desc    creates new password for user after forget password
// @access  Public
router.patch("/reset-password", hashPassword, validator(resetValidation), createNewPassword);

// @route   PATCH /password
// @desc    creates new password for user after forget password
// @access  Public
router.patch("/profile", auth, validator(updateRiderValidation), updateRiderProfile);

router.get("/payout", auth, requestPayoutCtrl);
router.get("/payout/history", auth, checkPagination, getPayoutHistoryCtrl);

// update rider account details route
router.patch("/profile/account", auth, updateRiderAccountDetailsCtrl);

// delete account
router.post("/account", auth, deleteAccountCtrl);

export default router;
