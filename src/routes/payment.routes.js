import express from "express";
import auth from "../middleware/auth";
import {
  verifyTransaction, acknowledgeFlwWebhook, getAllBanks, createStoreSubaccount, updateSubaccount, getBankDetails
} from "../controllers/payment.controller";

const router = express.Router();

// @route   POST /
// @desc    verify transaction
// @access  Private
router.post("/verify", acknowledgeFlwWebhook, verifyTransaction);

// @route   POST /
// @desc    create new store account
// @access  Private
router.post("/subaccount", createStoreSubaccount);

// @route   PUT /
// @desc    edit store subaccount
// @access  Private
router.put("/subaccount", updateSubaccount);

// @route   GET /
// @desc    get all available banks
// @access  Private
router.get("/banks", getAllBanks);

// @route   GET /
// @desc    get all account details
// @access  Private
router.post("/banks/details", getBankDetails);

export default router;
