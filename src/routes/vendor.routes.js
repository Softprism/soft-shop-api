import express from "express";
import validator from "../middleware/validator";
import auth from "../middleware/auth";
import recommend_vendor from "../controllers/vendor.controller";
import recommendVendorValidation from "../validations/vendorValidation";

const router = express.Router();

// @route   Post /vendors/recommend
// @desc    recommend a vendor
// @access  Public
router.post("/recommend", validator(recommendVendorValidation), recommend_vendor);

export default router;
