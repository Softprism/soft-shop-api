import express from "express";

import getAddresses from "../utils/auto-complete-address";
import getGeocode from "../utils/geocode-address";
import validator from "../middleware/validator";
import geoCodeValidation from "../validations/geoCodeValidation";

import auth from "../middleware/auth";
import getDistance from "../utils/get-distance";

const router = express.Router();

// @route   GET /address
// @desc    Get address predictions from input
// @access  Private
router.get("/address", getAddresses);

// @route   GET /address
// @desc    Get address predictions from input
// @access  Private
router.get("/geocode", validator(geoCodeValidation), getGeocode);

// @route   GET /distance
// @desc    Get distance from user to store
// @access  Private
router.get("/distance", getDistance);

export default router;
