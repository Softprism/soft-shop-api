import express from "express";
import auth from "../middleware/auth";
import {
  verifyTransaction, acknowledgeFlwWebhook, getAllBanks, getBankDetails
} from "../controllers/payment.controller";

const router = express.Router();

// @route   POST /
// @desc    verify transaction
// @access  Private
router.post("/verify", acknowledgeFlwWebhook, verifyTransaction);

// @route   GET /
// @desc    get all available banks
// @access  Private
router.get("/banks", getAllBanks);

// @route   GET /
// @desc    get all account details
// @access  Private
router.post("/banks/details", getBankDetails);

export default router;