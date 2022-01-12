import express from "express";
import RiderController from "../controllers/rider.controller";
import validator from "../middleware/validator";
import checkPagination from "../middleware/checkPagination";
import {
  registerValidation, emailValidation, tokenValidation,
  resetValidation, loginValidation
} from "../validations/riderValidation";
import { hashPassword } from "../middleware/validationMiddleware";

const {
  getRiders, verifyToken, signup, signin, requestToken, forgotPassword, createNewPassword,
} = RiderController;

const router = express.Router();

// @route   GET /riders
// @desc    Get all riders
// @access  Public
router.get("/", checkPagination, getRiders);

// @route   POST /riders/verify
// @desc    send OTP to verify new rider signup email
// @access  Public
router.post("/token", validator(emailValidation), requestToken);

// @route   GET /riders/token
// @desc    validates a token
// @access  Public
router.post("/verify", validator(tokenValidation), verifyToken);

// @route   POST /riders/register
// @desc    Register a rider
// @access  Public
router.post("/register", hashPassword, validator(registerValidation), signup);

// @route   POST /riders/login
// @desc    Login a User & get token
// @access  Public
router.post("/signin", validator(loginValidation), signin);

// @route   POST /password
// @desc    reset a forget password
// @access  Public
router.post("/forgot-password", validator(emailValidation), forgotPassword);

// @route   PATCH /password
// @desc    creates new password for user after forget password
// @access  Public
router.patch("/reset-password", hashPassword, validator(resetValidation), createNewPassword);

export default router;
