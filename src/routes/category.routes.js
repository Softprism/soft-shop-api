import express from "express";
import { check, validationResult } from "express-validator";
import auth from "../middleware/auth";
import { isStoreAdmin } from "../middleware/Permissions";

import {
  getCategories,
  editCategory,
  deleteCategory,
  createCategory,
} from "../controllers/category.controller";
import validator from "../middleware/validator";
import { create_category, updateCategory } from "../validations/categoryValidation";

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
  auth,
  isStoreAdmin,
  validator(create_category),
  createCategory
);

// @route   PUT /category/edit/:id
// @desc    Edit Category Category
// @access  Public
router.put("/:id", auth, isStoreAdmin, validator(updateCategory), editCategory);

// @route   DELETE /category/delete/:id
// @desc    Create New Category
// @access  Public
router.delete("/:id", auth, isStoreAdmin, deleteCategory);

export default router;
