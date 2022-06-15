/* eslint-disable import/named */
import express from "express";
import {
  registerUser, loginUser, getLoggedInUser,
  updateUser, addItemToBasket, forgotPassword, validateToken,
  createNewPassword, verifyEmailAddress, getUserBasketItems,
  // createUserBasket,
  editBasketItems, deleteBasketItem, deleteAllBasketItems, addCard, removeCard
} from "../controllers/user.controller";
import validator from "../middleware/validator";
import auth from "../middleware/auth";

import { isUserVerified, hashPassword } from "../middleware/validationMiddleware";
import {
  registerValidation, emailValidation, loginValidation,
  resetPassword, updateUserValidation, addbasketValidation, editbasketValidation
} from "../validations/userValidation";
import {
  sendForgotPasswordMail, sendPasswordChangeMail, sendPlainEmail, sendSignUpOTPmail, sendUserSignUpMail
} from "../utils/sendMail";
import { sendForgotPasswordSMS, sendUserSignupSMS } from "../utils/sendSMS";

import User from "../models/user.model";
import { createLog } from "../services/logs.service";
import Token from "../models/tokens.model";
import getOTP from "../utils/sendOTP";

const router = express.Router();

// @route   POST /verify
// @desc    send OTP to verify new user signup email
// @access  Public
router.post(
  "/verify",
  validator(emailValidation),
  verifyEmailAddress,
  async (req, res) => {
    // send otp
    let token = await getOTP("user-signup", req.data.email);
    await sendSignUpOTPmail(req.data.email, token.otp);
  }
);

// @route   POST /users/register
// @desc    Register a User
// @access  Public
router.post(
  "/",
  validator(registerValidation),
  hashPassword,
  registerUser,
  async (req, res, next) => {
    // delete sign up token
    await Token.findByIdAndDelete(req.body.token);
    let user = await User.findById(req.data.user_id);
    // send email to user
    // capitalize user's first name
    user.first_name = user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1);
    await sendUserSignUpMail(user.email, user.first_name);
    // send sms to user
    await sendUserSignupSMS(req.data.phone);
    // check if node is in production
    // create log
    await createLog("user signup", "user", `A new user - ${user.first_name} ${user.last_name} with email - ${user.email} just signed on softshop`);
    // send log email
    await sendPlainEmail(
      "logs@soft-shop.app",
      "A new user has signed up",
      `A new user has signed up with email: ${user.email}`
    );
  }
);

// @route   POST /user/login
// @desc    Login a User & get token
// @access  Public

router.post("/login",
  validator(loginValidation),
  isUserVerified,
  loginUser,
  async (req, res) => {
    // add push token to user profile
    let user = await User.findById(req.data.id);
    if (req.body.pushDeviceToken) {
      console.log(req.body.pushDeviceToken);
      let existingToken = user.pushDeviceToken.find((res) => {
        return res === req.body.pushDeviceToken;
      });
      if (!existingToken) {
        user.pushDeviceToken.push(req.body.pushDeviceToken);
        await user.save();
      }
    }

    // create log
    await createLog("user Login", "user", `A new login from ${user.first_name} ${user.last_name} with email - ${user.email}`);
  });

// @route   GET /user/card
// @desc    returns a link to user to continue card addition
// @access  Public
router.get("/card", auth, addCard);

// @route   DELETE /user/card
// @desc    returns a link to user to continue card addition
// @access  Public
router.delete("/card", auth, removeCard);

// @route   GET /user/login
// @desc    Get logged in user
// @access  Private

router.get("/login", auth, getLoggedInUser);

// @route   PUT user/
// @desc    Update User Details
// @access  Private

router.put(
  "/",
  auth,
  validator(updateUserValidation),
  updateUser,
  async (req, res) => {
    let { user } = req.localData;
    // send mail to notify user of password change
    if (req.body.password && req.body.original_password) {
      await sendPasswordChangeMail(user.email);
      // create log
      await createLog("user update prfile", "user", `A user - ${user.first_name} ${user.last_name} with email - ${user.email} just updated their profile`);
    }
  }
);

// @route   POST /cart
// @desc    creates a basket for the user
// @access  Public
router.get("/basket", auth, getUserBasketItems);

// @route   POST /basket
// @desc    adds a product to User's basket
// @access  Public
router.post("/basket", auth, validator(addbasketValidation), addItemToBasket);

// @route   PUT /basket
// @desc    edit an item in user's basket
// @access  Public
router.put("/basket", auth, validator(editbasketValidation), editBasketItems);

// @route   DELETE /basket
// @desc    delete one item from user's basket
// @access  Public
router.delete("/basket", auth, deleteBasketItem);

// @route   DELETE /basket/all
// @desc    deletes all item in user's basket
// @access  Public
router.delete("/basket/all", auth, deleteAllBasketItems);

// @route   POST /password
// @desc    reset a forget password
// @access  Public
router.post(
  "/forgot-password",
  forgotPassword,
  async (req, res) => {
    let { user } = req.localData;
    // send otp & mail
    let token = await getOTP("user-forgot-password", email);
    await sendForgotPasswordMail(user.email, token.otp);
    await sendForgotPasswordSMS(user.phone_number, token.otp);
  }
);

// @route   GET /token
// @desc    validates a token
// @access  Public
router.post("/token", validateToken);

// @route   PATCH /password
// @desc    creates new password for user after forget password
// @access  Public
router.patch(
  "/password",
  hashPassword,
  validator(resetPassword),
  createNewPassword,
  async (req, res) => {
    let { user, token } = req.localData;

    // delete token
    await Token.findByIdAndDelete(token);

    // send confirmation email
    await sendPasswordChangeMail(user.email);
  }
);

export default router;
