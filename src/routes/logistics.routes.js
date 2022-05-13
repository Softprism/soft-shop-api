import express from "express";
import {
  companyDetails, companyLogin, companySignup, updateCompanyAddress, updateCompanyDetails, updateCompanyImage, updateLoginDetails, viewCompanyRiderDetails, viewCompanyRiders
} from "../controllers/logistics.controller";
import auth from "../middleware/auth";

const router = express.Router();

// signup company route
router.post(
  "/signup",
  companySignup,
);

// signin company route
router.post(
  "/signin",
  companyLogin,
);

// get company details route
router.get(
  "/",
  auth,
  companyDetails,
);

// update company address route
router.put(
  "/address",
  auth,
  updateCompanyAddress,
);

// update company login details route
router.put(
  "/login",
  auth,
  updateLoginDetails,
);

// update company image route
router.put(
  "/image",
  auth,
  updateCompanyImage,
);

// update company details route
router.put(
  "/",
  auth,
  updateCompanyDetails,
);

// get company riders route
router.get(
  "/riders",
  auth,
  viewCompanyRiders,
);

// get company's rider details route
router.get(
  "/riders/:riderId",
  auth,
  viewCompanyRiderDetails,
);
export default router;
