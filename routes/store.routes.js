import express from "express";
import { check } from "express-validator";
import { checkFeedbackRangeTypes } from "../utils/checkParamTypes.js";

const router = express.Router();

import {
  getStores,
  createStore,
  loginStore,
  getLoggedInStore,
  updateStore,
  addLabel,
  getLabels,
  getStore,
  getStoresNoGeo,
  getStoreSalesStats,
  bestSellers,
  getStoreFeedback,
  getInventoryList,
} from "../controllers/store.controller.js";

import { auth } from "../middleware/auth.js";
import { checkPagination } from "../middleware/checkPagination.js";
import { isStoreAdmin } from "../middleware/verifyStorePermission.js";

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

// @route   GET /store/labels
// @desc    Get a store's labels
// @access  Private
router.get("/labels", auth, isStoreAdmin, getLabels);

router.get("/stats/sales", auth, getStoreSalesStats);

router.get("/stats/best-sellers", auth, checkPagination, bestSellers);

router.get("/inventory", auth, isStoreAdmin, checkPagination, getInventoryList);

router.get(
  "/stats/feedback",
  auth,
  checkPagination,
  checkFeedbackRangeTypes,
  getStoreFeedback
);

// @route   GET /store
// @desc    Get store data, used when a store is being checked, produces store data like name, rating/reviews, menu labels, address, delivery time, and products
// @access  Private
router.get("/:storeId", auth, getStore);

// @route   POST /store/create
// @desc    Register a store
// @access  Public
router.post(
  "/",
  [
    check("name", "Please Enter Store Name").not().isEmpty(),
    // check('images', 'Please add images for your store').not().isEmpty(),
    check("address", "Please Enter Stores Address").not().isEmpty(),
    check("openingTime", "Please Enter Opening Time").not().isEmpty(),
    check("closingTime", "Please Enter Closing Time").not().isEmpty(),
    check("email", "Please Enter Valid Email").isEmail(),
    check("phone_number", "Please Enter Valid Phone Number").isMobilePhone(),
    check(
      "password",
      "Please Enter Password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  createStore
);

// @route   POST /store/login
// @desc    Login a store
// @access  Public
router.post(
  "/login",
  [
    check("email", "Please enter store email").not().isEmpty(),
    check(
      "password",
      "Please Enter Password with 6 or more characters"
    ).isLength({ min: 6 }),
    check("password", "Password is Required").exists(),
  ],
  loginStore
);

// @route   PUT /store/
// @desc    Update a store
// @access  Private
router.put("/", auth, isStoreAdmin, updateStore);

// @route   PUT /stores/label
// @desc    add label to store
// @access  Private
router.put("/label", auth, isStoreAdmin, addLabel);
export default router;
