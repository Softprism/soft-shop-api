import express from "express";
import * as validate from "../middleware/validationMiddleware.js";

const router = express.Router();

import {
  getUsers,
  registerUser,
  loginUser,
  getLoggedInUser,
  updateUser,
  addItemToBasket,
  forgotPassword,
  validateToken,
  createNewPassword,
  verifyEmailAddress,
  getUserBasketItems,
  // createUserBasket,
  editBasketItems,
  deleteBasketItem,
  deleteAllBasketItems,
} from "../controllers/user.controller.js";

import { auth } from "../middleware/auth.js";
import { checkPagination } from "../middleware/checkPagination.js";

// @route   GET /users
// @desc    Get all Users
// @access  Public
router.get("/", checkPagination, getUsers);

// @route   POST /verify
// @desc    send OTP to verify new user signup email
// @access  Public
router.post("/verify", verifyEmailAddress);

// @route   POST /users/register
// @desc    Register a User
// @access  Public
router.post("/", registerUser);

// @route   POST /user/login
// @desc    Login a User & get token
// @access  Public

router.post("/login", validate.userLogin, loginUser);

// @route   GET /user/login
// @desc    Get logged in user
// @access  Private

router.get("/login", auth, getLoggedInUser);

// @route   PUT user/
// @desc    Update User Details
// @access  Private

router.put("/", auth, updateUser);

// @route   POST /cart
// @desc    creates a basket for the user
// @access  Public
router.get("/basket", auth, getUserBasketItems);

// @route   POST /basket
// @desc    adds a product to User's basket
// @access  Public
router.post("/basket", auth, addItemToBasket);

// @route   PUT /basket
// @desc    edit an item in user's basket
// @access  Public
router.put("/basket", auth, editBasketItems);

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
router.post("/forgot-password", forgotPassword);

// @route   GET /token
// @desc    validates a token
// @access  Public
router.post("/token", validateToken);

// @route   PATCH /password
// @desc    creates new password for user after forget password
// @access  Public
router.patch("/password", createNewPassword);

export default router;
