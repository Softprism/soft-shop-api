import { validationResult } from "express-validator";
import * as storeService from "../services/store.service";

const getStores = async (req, res, next) => {
  const stores = await storeService.getStores(req.query);

  return res.status(200).json({ success: true, result: stores, size: stores.length });
};

const getStoresNoGeo = async (req, res, next) => {
  const stores = await storeService.getStoresNoGeo(req.query);

  return res.status(200).json({ success: true, result: stores, size: stores.length });
};

const createStore = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let error_msgs = [];
    errors.array().forEach((element) => {
      error_msgs = [...error_msgs, element.msg];
    });

    return res.status(400).json({
      success: false,
      errors: error_msgs,
    });
  }

  const store = await storeService.createStore(req.body);

  if (store.err) {
    res.status(409).json({ success: false, msg: store.err, status: store.status });
  } else {
    res.status(201).json({ success: true, result: store });
  }
};

const loginStore = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const store = await storeService.loginStore(req.body);

    if (store.err) {
      return res.status(403).json({ success: false, msg: store.err, status: store.status });
    }
    res.status(200).json({ success: true, result: store });
  } catch (error) {
    next(error);
  }
};

const getLoggedInStore = async (req, res, next) => {
  // Call Get Logged in User function from userService
  const store = await storeService.getLoggedInStore(req.store.id);

  if (store.err) {
    res.status(500).json({ success: false, msg: store.err, status: store.status });
  } else {
    res.status(200).json({
      success: true,
      result: store,
    });
  }
};

const updateStore = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().msg,
    });
  }

  let storeID;
  if (req.store) storeID = req.store.id;
  if (req.query.storeID && req.admin) storeID = req.query.storeID;

  const store = await storeService.updateStore(storeID, req.body);

  if (store.err) {
    res.status(500).json({ success: false, msg: store.err, status: store.status });
  } else {
    res.status(200).json({ success: true, result: store });
  }
};

const addLabel = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().msg,
    });
  }

  let storeID;
  if (req.store) storeID = req.store.id;
  if (req.query.storeID && req.admin) storeID = req.query.storeID;

  const store = await storeService.addLabel(storeID, req.body);
  if (store.err) {
    res.status(500).json({ success: false, msg: store.err, status: store.status });
  } else {
    res.status(200).json({ success: true, result: store });
  }
};

const getLabels = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().msg,
    });
  }

  let storeID;
  if (req.store) storeID = req.store.id;
  if (req.query.storeID && req.admin) storeID = req.query.storeID;

  const store = await storeService.getLabels(storeID);
  if (store.err) {
    res.status(500).json({ success: false, msg: store.err, status: store.status });
  } else {
    res.status(200).json({ success: true, result: store });
  }
};

const getStore = async (req, res, next) => {
  try {
    const storeDetails = await storeService.getStore(req.params.storeId);

    if (storeDetails.err) {
      return res.status(403).json({ success: false, msg: storeDetails.err, status: storeDetails.status });
    }
    res.status(200).json({ success: true, result: storeDetails });
  } catch (error) {
    next(error);
  }
};

const getStoreSalesStats = async (req, res, next) => {
  try {
    const salesStats = await storeService.getStoreSalesStats(
      req.store.id,
      req.query.days
    );

    if (salesStats.err) { return res.status(403).json({ success: false, msg: salesStats.err, status: salesStats.status }); }

    return res.status(200).json({ success: true, result: salesStats });
  } catch (error) {
    next(error);
  }
};

const bestSellers = async (req, res, next) => {
  try {
    const bestSellingItems = await storeService.bestSellers(
      req.store.id,
      req.query
    );
    if (bestSellingItems.err) {
      return res.status(403).json({
        success: false, msg: bestSellingItems.err, status: bestSellingItems.status
      });
    }
    res.status(200).json({ success: true, result: bestSellingItems });
  } catch (error) {
    next(error);
  }
};

const getStoreFeedback = async (req, res, next) => {
  try {
    const feedbacks = await storeService.getStoreFeedback(
      req.store.id,
      req.query
    );
    if (feedbacks.err) {
      return res.status(403).json({
        success: false, msg: feedbacks.err, status: feedbacks.status
      });
    }

    return res.status(200).json({
      success: true,
      result: { feedbacks, size: feedbacks.length },
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryList = async (req, res, next) => {
  try {
    const inventoryList = await storeService.getInventoryList(req.query);

    if (inventoryList.err) {
      return res.status(403).json({ success: false, msg: inventoryList.err, status: inventoryList.status });
    }

    return res.status(200).json({
      success: true,
      result: { inventoryList, size: inventoryList.length },
    });
  } catch (error) {
    next(error);
  }
};

export {
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
};
