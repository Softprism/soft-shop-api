/* eslint-disable import/named */
import express from "express";
import { check } from "express-validator";
import { isAdmin } from "../middleware/Permissions";
import {
  getAdmins,
  registerAdmin,
  loginAdmin,
  getLoggedInAdmin,
  updateAdmin,
  resetStorePassword,
  confirmStoreUpdate,
  createTransaction,
  confirmStorePayout
} from "../controllers/admin.controller";

import auth from "../middleware/auth";

const router = express.Router();

// @route   GET /admins/all
// @desc    Get all Admin Users
// @access  Public
router.get("/all", auth, isAdmin, getAdmins);

// @route   POST admin/register
// @desc    Register an Admin account
// @access  Public
router.post(
  "/register",
  [
    check("username", "Please Enter Username").not().isEmpty(),
    check(
      "password",
      "Please Enter Password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  registerAdmin
);

// @route   POST admins/login
// @desc    Login a User & get token
// @access  Public
router.post(
  "/login",
  [
    check("username", "Please enter a Username").exists(),
    check("password", "Password should be 6 characters or more").isLength({
      min: 6,
    }),
    check("password", "Password is Required").exists(),
  ],
  loginAdmin
);

// @route   GET admins/login
// @desc    Get logged in user
// @access  Private
router.get("/", auth, isAdmin, getLoggedInAdmin);

// @route   PUT admins/:id
// @desc    Update User Details
// @access  Private
router.put("/", auth, isAdmin, updateAdmin);

router.patch("/password-reset/store/:email", auth, isAdmin, resetStorePassword);

// @route   PUT /store/
// @desc    Update a store
// @access  Private
router.put("/store/:storeID", auth, isAdmin, confirmStoreUpdate);

router.post("/transactions", auth, isAdmin, createTransaction);

router.put("/transactions/:storeID", auth, isAdmin, confirmStorePayout);

export default router;
