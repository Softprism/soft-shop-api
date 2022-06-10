import express from "express";
import validator from "../middleware/validator";
import auth from "../middleware/auth";
import recommend_vendor from "../controllers/vendor.controller";
import recommendVendorValidation from "../validations/vendorValidation";

const router = express.Router();

// @route   Post /vendors/recommend
// @desc    recommend a vendor
// @access  Public
router.post(
  "/recommend",
  validator(recommendVendorValidation),
  recommend_vendor,
  // check if node env is production
  async (req, res) => {
    if (NODE_ENV === "production") {
      // create log
      await createLog("new vendor recommended", "vendor", `A new vendor recommended from ${req.data.email}`);
      await sendPlainEmail(
        "logs@soft-shop.app",
        "A new vendor recommended",
        `A new vendor recommended with email: ${req.data.email}`,
      );
    }
  }
);

export default router;
