import * as productService from "../services/product.service";

const getProducts = async (req, res, next) => {
  if (req.query.skip === undefined || req.query.limit === undefined) {
    res
      .status(400)
      .json({ success: false, msg: "filtering parameters are missing", status: 400 });
  }

  const allProducts = await productService.getProducts(req.query);

  return res.status(200).json({
    success: true, result: allProducts, status: 200, size: allProducts.length
  });
};

const createProduct = async (req, res, next) => {
  try {
    let storeID; // container to store the store's ID, be it a store request or an admin request

    if (req.store) storeID = req.store.id;
    if (req.query.storeID && req.admin) storeID = req.query.storeID;

    const product = await productService.createProduct(req.body, storeID);

    if (product.err) return res.status(product.status).json({ success: false, msg: product.err, status: product.status });

    return res.status(201).json({ success: true, result: product, status: 201 });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  let storeID; // container to store the store's ID, be it a store request or an admin request
  if (req.store) storeID = req.store.id;
  if (req.query.storeID && req.admin) storeID = req.query.storeID;

  const request = await productService.updateProduct(
    req.body,
    req.params.id,
    storeID
  );
  if (request.err) return res.status(request.status).json({ success: false, msg: request.err, status: request.status });

  return res.status(200).json({ success: true, result: request, status: 200 });
};

const deleteProduct = async (req, res, next) => {
  let storeID;
  if (req.store) storeID = req.store.id;

  if (req.query.storeID && req.admin) storeID = req.query.storeID;

  const product = await productService.deleteProduct(req.params.id, storeID);

  if (product.err) return res.status(product.status).json({ success: false, msg: product.err, status: product.status });

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
    return res.status(newReview.status).json({ success: false, msg: newReview.err, status: newReview.status });
  }

  res.status(200).json({ success: true, result: newReview, status: 200 });
};

const getProductDetails = async (req, res, next) => {
  const productDetails = await productService.getProductDetails(
    req.params.productId
  );

  if (productDetails.err) {
    return res.status(productDetails.status).json({ success: false, msg: productDetails.err, status: productDetails.status });
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
      res.status(createVariant.status).json({ success: false, msg: createVariant.err, status: createVariant.status });
    } else {
      res.status(200).json({ success: true, result: createVariant, status: 200 });
    }
  } catch (error) {
    next(error);
  }
};

const updateVariant = async (req, res, next) => {
  try {
    let storeID;
    if (req.store) storeID = req.store.id;
    if (req.query.storeID && req.admin) storeID = req.query.storeID;

    const updateVariant = await productService.updateVariant(
      req.params.variantId,
      req.body
    );

    if (updateVariant.err) {
      res.status(updateVariant.status).json({ success: false, msg: updateVariant.err, status: updateVariant.status });
    } else {
      res.status(200).json({ success: true, result: updateVariant, status: 200 });
    }
  } catch (error) {
    next(error);
  }
};

const addVariantItem = async (req, res, next) => {
  try {
    let storeID;
    if (req.store) storeID = req.store.id;
    if (req.query.storeID && req.admin) storeID = req.query.storeID;

    const addVariantItem = await productService.addVariantItem(
      storeID,
      req.params.variantId,
      req.body
    );

    if (addVariantItem.err) {
      res.status(addVariantItem.status).json({ success: false, msg: addVariantItem.err, status: addVariantItem.status });
    } else {
      res.status(200).json({ success: true, result: addVariantItem, status: 200 });
    }
  } catch (error) {
    next(error);
  }
};

const getStoreVariants = async (req, res, next) => {
  try {
    let storeID;
    if (req.store) storeID = req.store.id;
    if (req.query.storeID && req.admin) storeID = req.query.storeID;

    const storeVariants = await productService.getStoreVariants(storeID);

    if (storeVariants.err) {
      res.status(storeVariants.status).json({ success: false, msg: storeVariants.err, status: storeVariants.status });
    } else {
      res.status(200).json({ success: true, result: storeVariants, status: 200 });
    }
  } catch (error) {
    next(error);
  }
};
const getStoreVariantsForUsers = async (req, res, next) => {
  try {
    const storeVariants = await productService.getStoreVariants(req.params.storeId);

    if (storeVariants.err) {
      res.status(storeVariants.status).json({ success: false, msg: storeVariants.err, status: storeVariants.status });
    } else {
      res.status(200).json({ success: true, result: storeVariants, status: 200 });
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
      res.status(getVariantItem.status).json({ success: false, msg: getVariantItem.err, status: getVariantItem.status });
    } else {
      res.status(200).json({ success: true, result: getVariantItem, status: 200 });
    }
  } catch (error) {
    next(error);
  }
};

const addCustomFee = async (req, res, next) => {
  try {
    let storeID;
    if (req.store) storeID = req.store.id;
    if (req.query.storeID && req.admin) storeID = req.query.storeID;

    const addCustomFee = await productService.addCustomFee(storeID, req.body);
    if (addCustomFee.err) {
      res.status(addCustomFee.status).json({ success: false, msg: addCustomFee.err, status: addCustomFee.status });
    } else {
      res.status(200).json({ success: true, result: addCustomFee });
    }
  } catch (error) {
    next(error);
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
    res.status(deleteCustomFee.status).json({ success: false, msg: deleteCustomFee.err, status: deleteCustomFee.status });
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
  getStoreVariantsForUsers
};
