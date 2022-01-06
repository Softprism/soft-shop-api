import express from "express";
import {
  acknowledgeFlwWebhook, getAllBanks, getBankDetails
} from "../controllers/payment.controller";

import { verifyTransaction } from "../services/payment.service";

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
