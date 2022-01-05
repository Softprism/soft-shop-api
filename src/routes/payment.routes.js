import express from "express";
import auth from "../middleware/auth";
import { verifyTransaction, acknowledgeFlwWebhook } from "../controllers/payment.controller";

const router = express.Router();

// @route   POST /
// @desc    verify transaction
// @access  Private
router.post("/verify", acknowledgeFlwWebhook, verifyTransaction);

export default router;
