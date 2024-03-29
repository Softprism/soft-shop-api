/* eslint-disable import/named */
import express from "express";

import auth from "../middleware/auth";
import getRiderDashboard from "../controllers/dashboard.controller";
import checkPagination from "../middleware/checkPagination";

const router = express.Router();

// @route   GET /dashboards
// @desc    Get rider dashboard
// @access  Private
router.get("/", checkPagination, auth, getRiderDashboard);

// @route   GET /riders/token
export default router;
