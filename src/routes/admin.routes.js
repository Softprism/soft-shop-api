/* eslint-disable import/named */
import express from "express";
import { isAdmin, isFinance, isOwner } from "../middleware/Permissions";
import {
  getAdmins, registerAdmin, loginAdmin, getLoggedInAdmin, updateAdmin,
  resetStorePassword, confirmStoreUpdate, createTransaction, confirmStorePayout,
  createNotification, createCompayLedger, getAllStoresUpdateRequests,
  getResetPasswordRequests, toggleStore, getAllStores, getUsers,
  getUserById, getStoreById, sendRiderMail, sendStoreMail, sendUserMail,

  sendAllStoresMails, sendAllRidersMails, sendAllUsersMails, sendAllMails, inviteUsersToBeta, confirmRiderAccountDetails, confirmLogisticsAccountDetails, addUserDiscount, sendStoreSignUpFollowUpMailCtrl, createRoles, getRoles, getRole, pproveDeleteRquest, getDeletionRequests, approveDeleteRquest, getRiderById, getAllRiders, storeSignUpStats, riderSignUpStats, userSignUpStats, completedOrderStats, completedSalesStats, statsOverview, incomeChecker, createReferralAccount

} from "../controllers/admin.controller";
import validator from "../middleware/validator";
import { register, login } from "../validations/adminValidation";

import auth from "../middleware/auth";
import { getTransactions } from "../controllers/payment.controller";
import checkPagination from "../middleware/checkPagination";
import { getActivitiesCtrl, getActivityCtrl, getUserActivitiesCtrl } from "../controllers/activities.controller";

const router = express.Router();

// @route   GET /admins/stores
// @desc    Get all Admin Users
// @access  Public
router.get("/all", auth, isAdmin, checkPagination, getAdmins);

// @route   GET /admins/stores
// @desc    Get all Stores
// @access  Private
router.get("/stores", auth, isAdmin, checkPagination, getAllStores);

// @route   GET /stores
// @desc    Get all update requests from all stores.
// @access  Private
router.get("/stores/updates", auth, checkPagination, getAllStoresUpdateRequests);

// @route   GET /admins/stores/:storeId
// @desc    Get a Store
// @access  Private
router.get("/stores/:storeId", auth, isAdmin, getStoreById);

// @route   GET /users
// @desc    Get all Users
// @access  Private
router.get("/users", auth, isAdmin, checkPagination, getUsers);

// @route   GET /users/:userId
// @desc    Get a User
// @access  Private
router.get("/referrals/users/:userId", auth, createReferralAccount);

// @route   GET /users/:userId
// @desc    Get a User
// @access  Private
router.get("/users/:userId", auth, isAdmin, getUserById);

// @route   GET /admins/riders
// @desc    Get all riders
// @access  Private
router.get("/riders", auth, isAdmin, checkPagination, getAllRiders);

// @route   GET /admins/rider/id
// @desc    Get rider details
// @access  Private
router.get("/riders/:riderId", auth, isAdmin, getRiderById);

// @route   POST admin/register
// @desc    Register an Admin account
// @access  Public
router.post(
  "/register",
  validator(register),
  registerAdmin
);

// @route   POST admins/login
// @desc    Login a User & get token
// @access  Public
router.post(
  "/login",
  validator(login),
  loginAdmin
);

// @route   POST admins create notification
// @desc    create notification for riders
// @access  Private
router.post("/notifications", createNotification);

// @route   GET admins/login
// @desc    Get logged in user
// @access  Private
router.get("/", auth, isAdmin, getLoggedInAdmin);

// @route   PUT admins/:id
// @desc    Update User Details
// @access  Private
router.put("/:id", auth, isAdmin, updateAdmin);

router.get("/password-reset/store", auth, checkPagination, getResetPasswordRequests);

router.patch("/password-reset/store/:email", auth, isAdmin, resetStorePassword);

// @route   PUT /store/:storeId
// @desc    confirm a store update request
// @access  Private
router.put("/store/:storeId", auth, isAdmin, confirmStoreUpdate);

router.post("/transactions", auth, isAdmin, createTransaction);

router.put("/transactions/", auth, isAdmin, confirmStorePayout);
router.put("/stores/:storeId/toggle", auth, isAdmin, toggleStore);

router.post("/ledger", auth, isAdmin, createCompayLedger);
router.get("/transactions", auth, isAdmin, getTransactions);

// approve rider update account details
router.put("/riders/account/:riderId", auth, isAdmin, confirmRiderAccountDetails);

// toggle approval for company account details
router.put("/logistics/account/:companyId", auth, isAdmin, confirmLogisticsAccountDetails);

router.post("/riders/:riderId", auth, isAdmin, sendRiderMail);
router.post("/riders", auth, isAdmin, sendAllRidersMails);

router.post("/stores/:storeId", auth, isAdmin, sendStoreMail);
router.post("/stores", auth, isAdmin, sendAllStoresMails);

router.post("/users/:userId", auth, isAdmin, sendUserMail);
router.post("/users", auth, isAdmin, sendAllUsersMails);

router.post("/mails", auth, isAdmin, sendAllMails);

// invite users to beta
router.post("/invite/users", auth, isAdmin, inviteUsersToBeta);

// add discount to user
router.post("/discounts/user", auth, isAdmin, addUserDiscount);

// send store signup follow up mail
router.post("/mails/follow-up/store/sign-up", auth, isAdmin, sendStoreSignUpFollowUpMailCtrl);

// get deletion requests
router.get("/deletion", auth, isAdmin, getDeletionRequests);

// approve deletion request
router.delete("/deletion/requests/:id", auth, isAdmin, approveDeleteRquest);

// create roles
router.post("/roles", auth, isAdmin, isOwner, createRoles);

// get roles
router.get("/roles", auth, isAdmin, isFinance, checkPagination, getRoles);

// get a role
router.get("/roles/:roleId", auth, isAdmin, isOwner, getRole);

// get all activities
router.get("/activities/all", auth, isAdmin, isOwner, checkPagination, getActivitiesCtrl);

// get an activity
router.get("/activities/info/:activityId", auth, isAdmin, isOwner, getActivityCtrl);

// get user activities
router.get("/activities/:actorId", auth, isAdmin, isOwner, checkPagination, getUserActivitiesCtrl);

// get store signup stats
router.get("/stats/stores/signup", auth, isAdmin, isOwner, storeSignUpStats);

// get rider signup stats
router.get("/stats/riders/signup", auth, isAdmin, isOwner, riderSignUpStats);

// get user signup stats
router.get("/stats/consumers/signup", auth, isAdmin, isOwner, userSignUpStats);

// get order stats
router.get("/stats/orders/completed", auth, isAdmin, isOwner, completedOrderStats);

// get sales stats
router.get("/stats/sales/completed", auth, isAdmin, isOwner, completedSalesStats);

// get stats overview
router.get("/stats/overview", auth, isAdmin, isOwner, statsOverview);

// get income overview
router.get("/stats/income", auth, isAdmin, isOwner, incomeChecker);
export default router;
