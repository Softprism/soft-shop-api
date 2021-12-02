import express from "express";
import { check } from "express-validator";

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
router.post(
  "/register",
  [
    check("first_name", "Please Enter First Name").not().isEmpty(),
    check("last_name", "Please Enter Last Name").not().isEmpty(),
    check("email", "Please Enter Valid Email").isEmail(),
    check("phone_number", "Please Enter Valid Phone Number").isMobilePhone(),
    check(
      "password",
      "Please Enter Password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  registerUser
);

// @route   POST /user/login
// @desc    Login a User & get token
// @access  Public

router.post(
  "/login",
  [
    check("email", "Please enter a Valid Email").isEmail(),
    check("password", "Password should be 6 characters or more").isLength({
      min: 6,
    }),
    check("password", "Password is Required").exists(),
  ],
  loginUser
);

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

// @route   PUT /password
// @desc    reset a forget password
// @access  Public
router.put("/forgot-password", forgotPassword);

// @route   GET /token
// @desc    validates a token
// @access  Public
router.get("/token", validateToken);

// @route   PATCH /password
// @desc    creates new password for user after forget password
// @access  Public
router.patch("/password", createNewPassword);

export default router;
