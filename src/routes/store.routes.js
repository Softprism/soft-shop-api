/* eslint-disable import/named */
import express from "express";
import { check } from "express-validator";
import checkFeedbackRangeTypes from "../utils/checkParamTypes";

import {
  getStores, createStore, loginStore, getLoggedInStore,
  updateStoreRequest, addLabel, getLabels, getStore,
  getStoresNoGeo, getStoreSalesStats, bestSellers,
  getStoreFeedback, getInventoryList, updateStore,
  requestPayout, getPayoutHistory, deleteStoreLabel,
  updateStoreLabel, updateStorePhoto,
  resetPassword
} from "../controllers/store.controller";
import { getStoreVariantsForUsers } from "../controllers/product.controller";

import auth from "../middleware/auth";
import checkPagination from "../middleware/checkPagination";
import { isStoreAdmin } from "../middleware/Permissions";
import { hashPassword } from "../middleware/validationMiddleware";
import validator from "../middleware/validator";
import {
  registerStore, updateStoreValidation, loginStoreValidation, storeRequest,
  labelValidation, deleteLabelValidation, editLabelValidation, updateStorePhotoValidation
} from "../validations/storeValidation";

import Store from "../models/store.model";
import { createLog } from "../services/logs.service";
import { sendPlainEmail, sendStoreSignUpMail } from "../utils/sendMail";

const router = express.Router();

// @route   GET /stores
// @desc    Get all registered stores
// @access  Private
router.get("/", auth, checkPagination, getStores);

// @route   GET /store
// @desc    Get all registered stores
// @access  Private
router.get("/nogeo", auth, checkPagination, getStoresNoGeo);

// @route   GET /stores/login
// @desc    Get logged in Store
// @access  Private
router.get("/login", auth, getLoggedInStore);

router.post("/reset-password", resetPassword);

// @route   GET /store/labels
// @desc    Get a store's labels
// @access  Private
router.get("/labels", auth, isStoreAdmin, getLabels);

router.get("/stats/sales", auth, getStoreSalesStats);

router.get("/stats/best-sellers", auth, checkPagination, bestSellers);

router.get("/inventory", auth, isStoreAdmin, checkPagination, getInventoryList);
router.get("/payout", auth, requestPayout);
router.get("/payout/history", auth, checkPagination, getPayoutHistory);

router.get(
  "/stats/feedback",
  auth,
  isStoreAdmin,
  checkPagination,
  checkFeedbackRangeTypes,
  getStoreFeedback
);

// @route   GET /stores/variants
// @desc   gets variants belonging to store for users
// @access  Private
router.get("/variants/:storeId", auth, getStoreVariantsForUsers);

// @route   GET /store
// @desc    Get store data, used when a store is being checked, produces store data like name, rating/reviews, menu labels, address, delivery time, and products
// @access  Private
router.get("/:storeId", auth, getStore);

// @route   POST /store/create
// @desc    Register a store
// @access  Public
router.post("/",
  validator(registerStore),
  hashPassword,
  createStore,
  async (req, res) => {
    // send welcome email
    await sendStoreSignUpMail(req.data.store.owner_email);
    // create log
    await createLog("new vendor signup", "store", `A new signup from ${req.data.store.owner_name} with email - ${req.data.store.owner_email}`);
    await sendPlainEmail(
      "logs@soft-shop.app",
      "A new vendor has signed up",
      `A new vendor has signed up with email: ${req.data.store.owner_email}`,
    );
  });

// @route   POST /store/login
// @desc    Login a store
// @access  Public
router.post(
  "/login",
  validator(loginStoreValidation),
  loginStore,
  async (req, res) => {
    // device token registration
    let pushReg = await Store.findById(req.data.id);

    if (req.body.vendorPushDeviceToken) {
      let existingToken = pushReg.vendorPushDeviceToken.find((res) => {
        return res === req.body.vendorPushDeviceToken;
      });
      if (!existingToken) {
        pushReg.vendorPushDeviceToken.push(req.body.vendorPushDeviceToken);
        await pushReg.save();
      }
    }
    if (req.body.orderPushDeviceToken) {
      let existingToken = pushReg.orderPushDeviceToken.find((res) => {
        return res === req.body.orderPushDeviceToken;
      });
      if (!existingToken) {
        pushReg.orderPushDeviceToken.push(req.body.orderPushDeviceToken);
        await pushReg.save();
      }
    }
    // create log
    await createLog("store Login", "store", `A new login from ${pushReg.name} with email - ${req.body.email}`);
  }
);

// @route   PUT /store/
// @desc    request for a store profile update
// @access  Private
router.put("/change-request", auth, isStoreAdmin, validator(storeRequest), updateStoreRequest);

// @route   PUT /store/
// @desc    Update a store
// @access  Private
router.put("/", auth, isStoreAdmin, validator(updateStoreValidation), hashPassword, updateStore);

// @route   PUT /store/
// @desc    Update a store
// @access  Private
router.put("/photo", auth, isStoreAdmin, validator(updateStorePhotoValidation), hashPassword, updateStorePhoto);

// @route   PUT /store/
// @desc    Update a store
// @access  Private
router.patch("/store-label", auth, isStoreAdmin, validator(editLabelValidation), updateStoreLabel);

// @route   PUT /store/
// @desc    Update a store
// @access  Private
router.delete("/store-label", auth, isStoreAdmin, validator(deleteLabelValidation), deleteStoreLabel);

// @route   PUT /stores/label
// @desc    add label to store
// @access  Private
router.put("/label", auth, isStoreAdmin, validator(labelValidation), addLabel);
export default router;
