import express from "express";
import { check, validationResult } from "express-validator";
import auth from "../middleware/auth";
import checkPagination from "../middleware/checkPagination";
import isStoreAdmin from "../middleware/verifyStorePermission";

import {
  getCategories,
  editCategory,
  deleteCategory,
  createCategory,
} from "../controllers/category.controller";

const router = express.Router();

// @route   GET /category
// @desc    Get all Categories
// @access  Public
router.get("/", auth, getCategories);

// @route   POST /category/new
// @desc    Create New Category
// @access  Public
router.post(
  "/",
  [
    check("name", "Please enter valid category name").isString(),
    check("image", "Please upload Image").exists(),
  ],
  auth,
  isStoreAdmin,
  createCategory
);

// @route   PUT /category/edit/:id
// @desc    Edit Category Category
// @access  Public
router.put("/:id", auth, isStoreAdmin, editCategory);

// @route   DELETE /category/delete/:id
// @desc    Create New Category
// @access  Public
router.delete("/:id", auth, isStoreAdmin, deleteCategory);

export default router;
