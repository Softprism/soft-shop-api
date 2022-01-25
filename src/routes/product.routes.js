import express from "express";
import { check, validationResult } from "express-validator";
import auth from "../middleware/auth";
import { isStoreAdmin } from "../middleware/Permissions";
import checkPagination from "../middleware/checkPagination";

import {
  deleteProduct, updateProduct, createProduct, getProducts,
  reviewProduct, getProductDetails, createVariant, updateVariant,
  addVariantItem, getVariantItem, addCustomFee, deleteCustomFee,
  getStoreVariants,
  deleteStoreVariant,
  deleteStoreVariantItem, updateVariantItem
} from "../controllers/product.controller";
import validator from "../middleware/validator";
import {
  createProducts, validateVariant, createFees, validateStoreProduct,
  reviewProductValidation, addVariantItemValidation, editVariantValidation,
  validateVariantItem
} from "../validations/productValidation";

const router = express.Router();

// @route   GET /
// @desc    Get all products from all stores.
// @access  Private
router.get("/", auth, checkPagination, getProducts);

// @route   POST /create
// @desc    add a new product to store
// @access  Private
router.post(
  "/",
  auth,
  isStoreAdmin,
  validator(createProducts),
  createProduct
);

// @route   PUT /review
// @desc    user adds review to a product
// @access  Private
router.put("/review", auth, validator(reviewProductValidation), reviewProduct);

// @route   PUT /stores/variants
// @desc    add variant to store
// @access  Private
router.put("/variants/:variantId/item",
  auth, isStoreAdmin, addVariantItem);

// @route   PUT /stores/variants/:variantId
// @desc    update store variant
// @access  Private
router.put("/variants/:variantId", auth, isStoreAdmin,
  validator(editVariantValidation), updateVariant);

// @route   DELETE /products/variants/:variantId
// @desc    delete store variant
// @access  Private
router.delete("/variants/:variantId", auth, isStoreAdmin, deleteStoreVariant);

// @route   DELETE /products/variants/:variantId/:itemId
// @desc    delete store variant
// @access  Private
router.delete("/variants/item/:itemId", auth, isStoreAdmin, deleteStoreVariantItem);

// @route   GET /stores/variants
// @desc   gets variants belonging to store
// @access  Private
router.get("/variants/", auth, getStoreVariants);

// @route   GET /stores/variantsItems
// @desc   gets variant items
// @access  Private
router.get(
  "/variants/:variantId",
  auth,
  checkPagination,
  getVariantItem
);

// @route   PUT /:id
// @desc    update a store product, can be used by admin and stores
// @access  Private
router.put("/:id",
  auth, isStoreAdmin, updateProduct);

// @route   GET /
// @desc    Get a product info.
// @access  Private
router.get("/:productId", auth, getProductDetails);

// @route   DELETE /:id
// @desc    delete a store product, can be used by admin and stores
// @access  Private
router.delete("/:id", auth, isStoreAdmin, deleteProduct);

// @route   POST /stores/variants
// @desc    add variant to store
// @access  Private
router.post("/variants",
  auth, isStoreAdmin,
  validator(validateVariant),
  createVariant);

// @route   POST /stores/variants
// @desc    add variant to store
// @access  Private
router.patch("/variants/:variantItemId/update-item",
  auth, isStoreAdmin,
  updateVariantItem);

// @route   POST /stores/custom-fees
// @desc    add custom fee to product
// @access  Private
router.post("/custom-fees",
  auth, isStoreAdmin,
  validator(createFees),
  addCustomFee);

// @route   DELETE /stores/custom-fees
// @desc    delete custom fee
// @access  Private
router.delete("/custom-fees/:customFeeId", auth, isStoreAdmin, deleteCustomFee);

export default router;
