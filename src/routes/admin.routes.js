/* eslint-disable import/named */
import express from "express";
import { isAdmin } from "../middleware/Permissions";
import {
  getAdmins, registerAdmin, loginAdmin, getLoggedInAdmin, updateAdmin,
  resetStorePassword, confirmStoreUpdate, createTransaction, confirmStorePayout,
  createNotification,
  createCompayLedger
} from "../controllers/admin.controller";
import validator from "../middleware/validator";
import { register, login } from "../validations/adminValidation";

import auth from "../middleware/auth";
import { getTransactions } from "../controllers/payment.controller";

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
  validator(register),
  registerAdmin
);

// @route   POST admins/login
// @desc    Login a User & get token
// @access  Public
router.post(
  "/login",
  validator(login),
  loginAdmin
);

// @route   POST admins create notification
// @desc    create notification for riders
// @access  Private
router.post("/notifications", createNotification);

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
router.put("/store/:storeId", auth, isAdmin, confirmStoreUpdate);

router.post("/transactions", auth, isAdmin, createTransaction);

router.put("/transactions/:storeId", auth, isAdmin, confirmStorePayout);

router.post("/ledger/:storeId", auth, isAdmin, createCompayLedger);
router.get("/transactions", auth, isAdmin, getTransactions);

export default router;
