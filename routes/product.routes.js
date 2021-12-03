import express from "express";
import { check, validationResult } from "express-validator";
import { auth } from "../middleware/auth.js";
const router = express.Router();

import {
  deleteProduct,
  updateProduct,
  createProduct,
  getProducts,
  reviewProduct,
  getProductDetails,
  createVariant,
  updateVariant,
  addVariantItem,
  getVariantItem,
  addCustomFee,
  deleteCustomFee,
} from "../controllers/product.controller.js";

// @route   GET /
// @desc    Get all products from all stores.
// @access  Private
router.get("/", auth, getProducts);

// @route   POST /create
// @desc    add a new product to store
// @access  Private
router.post(
  "/",
  [
    check("product_name", "Please Enter Product Name").not().isEmpty(),
    // check('images', 'Please add images for your store').not().isEmpty(),
    check("category", "Please select Category").not().isEmpty(),
    check("price", "Please enter price of product").not().isEmpty(),
    // check('rating', 'Please Enter Stores Address').not().isEmpty(),
  ],
  auth,
  createProduct
);

// @route   PUT /review
// @desc    user adds review to a product
// @access  Private
router.put("/review", auth, reviewProduct);

// @route   PUT /stores/variants
// @desc    add variant to store
// @access  Private
router.put("/variants/:variantId/item", auth, addVariantItem);

// @route   PUT /stores/variants
// @desc    add variant to store
// @access  Private
router.put("/variants/:variantId", auth, updateVariant);

// @route   GET /stores/variants
// @desc   gets variant items
// @access  Private
router.get("/variants/:variantId", auth, getVariantItem);

// @route   PUT /:id
// @desc    update a store product, can be used by admin and stores
// @access  Private
router.put("/:id", auth, updateProduct);

// @route   GET /
// @desc    Get a product info.
// @access  Private
router.get("/:productId", auth, getProductDetails);

// @route   DELETE /:id
// @desc    delete a store product, can be used by admin and stores
// @access  Private
router.delete("/:id", auth, deleteProduct);

// @route   POST /stores/variants
// @desc    add variant to store
// @access  Private
router.post("/variants", auth, createVariant);

// @route   POST /stores/custom-fees
// @desc    add custom fee to product
// @access  Private
router.post("/custom-fees", auth, addCustomFee);

// @route   DELETE /stores/custom-fees
// @desc    delete custom fee
// @access  Private
router.delete("/custom-fees/:customFeeId", auth, deleteCustomFee);

export default router;
