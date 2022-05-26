import express from "express";
import validator from "../middleware/validator";
import auth from "../middleware/auth";
import create_waitlist from "../controllers/waitlist.controller";
import waitlistValidation from "../validations/waitlistValidation";

const router = express.Router();

// @route   POST /waitlists
// @desc    Add an email to the waitlists
// @access  Public
router.post("/", validator(waitlistValidation), create_waitlist);

export default router;
