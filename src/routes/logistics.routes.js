import express from "express";
import {
  companyDetails, companyLogin, companySignup, deleteAccount, getAllCompanies, requestWithdrawal, updateCompanyAccountDetails, updateCompanyAddress, updateCompanyDetails, updateCompanyImage, updateLoginDetails, viewCompanyRiderDetails, viewCompanyRiders
} from "../controllers/logistics.controller";
import auth from "../middleware/auth";
import Logistics from "../models/logistics-company.model";
import { createLog } from "../services/logs.service";
import { sendPlainEmail, sendRiderSignupMail } from "../utils/sendMail";

const router = express.Router();

// get all companies route
router.get("/all", getAllCompanies);

// signup company route
router.post(
  "/signup",
  companySignup,
  async (req, res, next) => {
    // find logistics company
    const company = await Logistics.findById(req.data.company_id);

    // send signup mail
    await sendRiderSignupMail(company.email, company.companyName);
    // create log
    await createLog("logistics company signup", "logistics", `A new logistics company - ${company.companyName} with email - ${company.email} just signed up on softshop`);
    // send log email
    await sendPlainEmail(
      "logs@soft-shop.app",
      "A new logistics company has signed up",
      `A new logistics company has signed up with email: ${company.email}`
    );
  }
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

// update company account details route
router.put(
  "/account",
  auth,
  updateCompanyAccountDetails,
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

// company request withdrawal route
router.post(
  "/withdrawal",
  auth,
  requestWithdrawal,
);

// delete account
router.post("/account", auth, deleteAccount);

export default router;
