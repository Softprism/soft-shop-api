import express from "express";
import auth from "../middleware/auth";
import { verifyTransaction } from "../controllers/payment.controller";
import { acknowledgeFlwWebhook } from "../services/payment";

const router = express.Router();

// @route   POST /
// @desc    verify transaction
// @access  Private
router.post("/verify", acknowledgeFlwWebhook, verifyTransaction);

export default router;
