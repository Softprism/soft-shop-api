import { check, validationResult } from "express-validator";
import * as productService from "../services/product.service";

const getProducts = async (req, res, next) => {
  console.log(1234);
  if (req.query.skip === undefined || req.query.limit === undefined) {
    res
      .status(400)
      .json({ success: false, msg: "filtering parameters are missing" });
  }

  const allProducts = await productService.getProducts(req.query);

  if (allProducts.err) {
    res.status(400).json({ success: false, msg: allProducts.err, status: allProducts.status });
  }

  return res.status(200).json({ success: true, result: allProducts });
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

    if (product.err) return res.status(409).json({ success: false, msg: product.err, status: product.status });

    return res.status(201).json({ success: true, result: product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().msg,
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
  if (request.err) return res.status(400).json({ success: false, msg: request.err, status: request.status });

  return res.status(200).json({ success: true, result: request });
};

const deleteProduct = async (req, res, next) => {
  let storeID;
  if (req.store) storeID = req.store.id;

  if (req.query.storeID && req.admin) storeID = req.query.storeID;

  const product = await productService.deleteProduct(req.params.id, storeID);

  if (product.err) return res.status(404).json({ success: false, msg: product.err, status: product.status });

  return res.status(200).json({ success: true, result: product.msg });
};

const reviewProduct = async (req, res, next) => {
  if (req.store) {
    return res
      .status(400)
      .json({ success: false, msg: "action not allowed by store" });
  }
  const newReview = await productService.reviewProduct(req.body);

  if (newReview.err) {
    return res.status(400).json({ success: false, msg: newReview.err, status: newReview.status });
  }

  res.status(200).json({ success: true, result: newReview });
};

const getProductDetails = async (req, res, next) => {
  const productDetails = await productService.getProductDetails(
    req.params.productId
  );

  if (productDetails.err) {
    return res.status(400).json({ success: false, msg: productDetails.err, status: productDetails.status });
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
      res.status(500).json({ success: false, msg: createVariant.err, status: createVariant.status });
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
    res.status(500).json({ success: false, msg: updateVariant.err, status: updateVariant.status });
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
    res.status(500).json({ success: false, msg: addVariantItem.err, status: addVariantItem.status });
  } else {
    res.status(200).json({ success: true, result: addVariantItem });
  }
};

const getStoreVariants = async (req, res, next) => {
  try {
    let storeID;
    if (req.store) storeID = req.store.id;
    if (req.query.storeID && req.admin) storeID = req.query.storeID;

    const storeVariants = await productService.getStoreVariants(storeID);

    if (storeVariants.err) {
      res.status(500).json({ success: false, msg: storeVariants.err, status: storeVariants.status });
    } else {
      res.status(200).json({ success: true, result: storeVariants });
    }
  } catch (error) {
    next(error);
  }
};
const getVariantItem = async (req, res, next) => {
  try {
    let storeID;
    if (req.store) storeID = req.store.id;
    if (req.query.storeID && req.admin) storeID = req.query.storeID;

    const getVariantItem = await productService.getVariantItem(
      req.params.variantId,
      req.query
    );

    if (getVariantItem.err) {
      res.status(500).json({ success: false, msg: getVariantItem.err, status: getVariantItem.status });
    } else {
      res.status(200).json({ success: true, result: getVariantItem });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const addCustomFee = async (req, res, next) => {
  let storeID;
  if (req.store) storeID = req.store.id;
  if (req.query.storeID && req.admin) storeID = req.query.storeID;

  const addCustomFee = await productService.addCustomFee(storeID, req.body);
  if (addCustomFee.err) {
    res.status(500).json({ success: false, msg: addCustomFee.err, status: addCustomFee.status });
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
    res.status(500).json({ success: false, msg: deleteCustomFee.err, status: deleteCustomFee.status });
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
  getStoreVariants,
};