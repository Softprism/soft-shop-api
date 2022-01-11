/* eslint-disable import/named */
import express from "express";
import {
  getUsers, registerUser, loginUser, getLoggedInUser,
  updateUser, addItemToBasket, forgotPassword, validateToken,
  createNewPassword, verifyEmailAddress, getUserBasketItems,
  // createUserBasket,
  editBasketItems, deleteBasketItem, deleteAllBasketItems, addCard
} from "../controllers/user.controller";
import validator from "../middleware/validator";
import auth from "../middleware/auth";
import checkPagination from "../middleware/checkPagination";
import { isUserVerified, hashPassword } from "../middleware/validationMiddleware";
import { registerValidation, emailValidation, loginValidation } from "../validations/userValidation";

const router = express.Router();

// @route   GET /users
// @desc    Get all Users
// @access  Public
router.get("/", checkPagination, getUsers);

// @route   POST /verify
// @desc    send OTP to verify new user signup email
// @access  Public
router.post("/verify", validator(emailValidation), verifyEmailAddress);

// @route   POST /users/register
// @desc    Register a User
// @access  Public
router.post("/", validator(registerValidation), hashPassword, registerUser);

// @route   POST /user/login
// @desc    Login a User & get token
// @access  Public

router.post("/login", validator(loginValidation), isUserVerified, loginUser);

// @route   POST /user/card
// @desc    returns a link to user to continue card addition
// @access  Public
router.get("/card", auth, addCard);

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
router.patch("/password", hashPassword, createNewPassword);

export default router;
