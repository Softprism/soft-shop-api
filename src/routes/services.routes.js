import express from "express";

import getAddresses from "../utils/auto-complete-address";
import getGeocode from "../utils/geocode-address";

import auth from "../middleware/auth";

const router = express.Router();

// @route   GET /address
// @desc    Get address predictions from input
// @access  Private
router.get("/address", auth, getAddresses);

// @route   GET /address
// @desc    Get address predictions from input
// @access  Private
router.get("/geocode", auth, getGeocode);

export default router;
