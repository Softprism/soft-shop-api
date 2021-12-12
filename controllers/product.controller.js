import express from "express";
import * as productService from "../services/product.service.js";
import { auth } from "../middleware/auth.js";
import { check, validationResult } from "express-validator";

const getProducts = async (req, res, next) => {
  console.log(1234);
  if (req.query.skip === undefined || req.query.limit === undefined) {
    res
      .status(400)
      .json({ success: false, msg: "filtering parameters are missing" });
  }

  const allProducts = await productService.getProducts(req.query);

  if (allProducts.err) {
    res.status(400).json({ success: false, msg: allProducts.err });
  }

  allProducts && allProducts.length > 0
    ? res.status(200).json({ success: true, result: allProducts })
    : res.status(404).json({ success: false, msg: "No product found" });
};

const createProduct = async (req, res, next) => {
  try {
    let storeID; // container to store the store's ID, be it a store request or an admin request

    if (req.store) storeID = req.store.id;
    if (req.query.storeID && req.admin) storeID = req.query.storeID;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      let error_msgs = [];
      errors.array().forEach((element) => {
        error_msgs = [...error_msgs, element.msg];
      });

      return res.status(400).json({ success: false, msg: error_msgs });
    }

    const product = await productService.createProduct(req.body, storeID);

    product.err
      ? res.status(409).json({ success: false, msg: product.err })
      : res.status(201).json({ success: true, result: product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array()["msg"],
    });
  }

  let storeID; // container to store the store's ID, be it a store request or an admin request
  if (req.store) storeID = req.store.id;
  if (req.query.storeID && req.admin) storeID = req.query.storeID;

  const request = await productService.updateProduct(
    req.body,
    req.params.id,
    storeID
  );
  request.err
    ? res.status(400).json({ success: false, msg: request.err })
    : res.status(200).json({ success: true, result: request });
};

const deleteProduct = async (req, res, next) => {
  let storeID;
  if (req.store) storeID = req.store.id;

  if (req.query.storeID && req.admin) storeID = req.query.storeID;

  const product = await productService.deleteProduct(req.params.id, storeID);

  product.err
    ? res.status(404).json({ success: false, msg: product.err })
    : res.status(201).json({ success: true, result: product.msg });
};

const reviewProduct = async (req, res, next) => {
  if (req.store) {
    return res
      .status(400)
      .json({ success: false, msg: "action not allowed by store" });
  }
  const newReview = await productService.reviewProduct(req.body);

  if (newReview.err) {
    return res.status(400).json({ success: false, msg: newReview.err });
  }

  res.status(200).json({ success: true, result: newReview });
};

const getProductDetails = async (req, res, next) => {
  const productDetails = await productService.getProductDetails(
    req.params.productId
  );

  if (productDetails.err) {
    return res.status(400).json({ success: false, msg: productDetails.err });
  }

  res.status(200).json({ success: true, result: productDetails });
};

const createVariant = async (req, res, next) => {
  try {
    let storeID;
    if (req.store) storeID = req.store.id;
    if (req.query.storeID && req.admin) storeID = req.query.storeID;

    const createVariant = await productService.createVariant(storeID, req.body);
    if (createVariant.err) {
      res.status(500).json({ success: false, msg: createVariant.err });
    } else {
      res.status(200).json({ success: true, result: createVariant });
    }
  } catch (error) {
    next(error);
  }
};

const updateVariant = async (req, res, next) => {
  let storeID;
  if (req.store) storeID = req.store.id;
  if (req.query.storeID && req.admin) storeID = req.query.storeID;

  const updateVariant = await productService.updateVariant(
    req.params.variantId,
    req.body
  );

  if (updateVariant.err) {
    res.status(500).json({ success: false, msg: updateVariant.err });
  } else {
    res.status(200).json({ success: true, result: updateVariant });
  }
};

const addVariantItem = async (req, res, next) => {
  let storeID;
  if (req.store) storeID = req.store.id;
  if (req.query.storeID && req.admin) storeID = req.query.storeID;

  const addVariantItem = await productService.addVariantItem(
    req.params.variantId,
    req.body
  );

  if (addVariantItem.err) {
    res.status(500).json({ success: false, msg: addVariantItem.err });
  } else {
    res.status(200).json({ success: true, result: addVariantItem });
  }
};

const getVariantItem = async (req, res, next) => {
  // verifiy permission
  if (req.admin === undefined && req.store === undefined)
    return res.status(403).json({
      success: false,
      msg: "You're not permitted to carry out this action",
    });

  if (req.store === undefined && req.query.storeID === undefined) {
    res
      .status(400)
      .json({ success: false, msg: "unable to authenticate this store" });
  }

  let storeID;
  if (req.store) storeID = req.store.id;
  if (req.query.storeID && req.admin) storeID = req.query.storeID;

  const getVariantItem = await productService.getVariantItem(
    req.params.variantId
  );

  if (getVariantItem.err) {
    res.status(500).json({ success: false, msg: getVariantItem.err });
  } else {
    res.status(200).json({ success: true, result: getVariantItem });
  }
};

const addCustomFee = async (req, res, next) => {
  let storeID;
  if (req.store) storeID = req.store.id;
  if (req.query.storeID && req.admin) storeID = req.query.storeID;

  const addCustomFee = await productService.addCustomFee(storeID, req.body);
  if (addCustomFee.err) {
    res.status(500).json({ success: false, msg: addCustomFee.err });
  } else {
    res.status(200).json({ success: true, result: addCustomFee });
  }
};

const deleteCustomFee = async (req, res, next) => {
  let storeID;
  if (req.store) storeID = req.store.id;
  if (req.query.storeID && req.admin) storeID = req.query.storeID;

  const deleteCustomFee = await productService.deleteCustomFee(
    req.params.customFeeId
  );
  if (deleteCustomFee.err) {
    res.status(500).json({ success: false, msg: deleteCustomFee.err });
  } else {
    res.status(200).json({ success: true, result: deleteCustomFee });
  }
};
export {
  deleteProduct,
  updateProduct,
  createProduct,
  getProducts,
  getProductDetails,
  reviewProduct,
  createVariant,
  updateVariant,
  addVariantItem,
  getVariantItem,
  addCustomFee,
  deleteCustomFee,
};
