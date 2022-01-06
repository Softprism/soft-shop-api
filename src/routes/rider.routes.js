/* eslint-disable import/named */
import express from "express";

import RiderController from "../controllers/rider.controller";

// import auth from "../middleware/auth";
import checkPagination from "../middleware/checkPagination";
import {
  isUserVerified, verifyUserSignupParam,
  verifyEmailAddressChecker, verifyUserLoginParams, hashPassword
} from "../middleware/validationMiddleware";

const {
  getRiders, verifyToken, signup, signin, requestToken
} = RiderController;

const router = express.Router();

// @route   GET /riders
// @desc    Get all riders
// @access  Public
router.get("/", checkPagination, getRiders);

// @route   POST /riders/verify
// @desc    send OTP to verify new rider signup email
// @access  Public
router.post("/token", verifyEmailAddressChecker, requestToken);

// @route   GET /riders/token
// @desc    validates a token
// @access  Public
router.post("/verify", verifyToken);

// @route   POST /riders/register
// @desc    Register a rider
// @access  Public
router.post("/register", verifyUserSignupParam, hashPassword, signup);

// @route   POST /riders/login
// @desc    Login a User & get token
// @access  Public
router.post("/signin", verifyUserLoginParams, isUserVerified, signin);

// @route   POST /password
// @desc    reset a forget password
// @access  Public
// router.post("/forgot-password", forgotPassword);

// @route   PATCH /password
// @desc    creates new password for user after forget password
// @access  Public
// router.patch("/password", hashPassword, createNewPassword);
export default router;
