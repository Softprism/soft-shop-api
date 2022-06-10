import express from "express";
import validator from "../middleware/validator";
import auth from "../middleware/auth";
import create_waitlist from "../controllers/waitlist.controller";
import waitlistValidation from "../validations/waitlistValidation";

const router = express.Router();

// @route   POST /waitlists
// @desc    Add an email to the waitlists
// @access  Public
router.post("/",
  validator(waitlistValidation),
  create_waitlist,
  // check if node env is production
  async (req, res) => {
    if (NODE_ENV === "production") {
    // create log
      await createLog("new waitlist", "waitlist", `A new waitlist from ${req.data.email}`);
      await sendPlainEmail(
        "logs@soft-shop.app",
        "A new waitlist has signed up",
        `A new waitlist has signed up with email: ${req.body.email}`,
      );
    }
  });

export default router;
