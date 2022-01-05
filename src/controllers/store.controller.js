import { validationResult } from "express-validator";
import * as storeService from "../services/store.service";

const getStores = async (req, res, next) => {
  try {
    const stores = await storeService.getStores(req.query);
    return res.status(200).json({
      success: true, result: stores, size: stores.length, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const getStoresNoGeo = async (req, res, next) => {
  try {
    const stores = await storeService.getStoresNoGeo(req.query);

    return res.status(200).json({
      success: true, result: stores, size: stores.length, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const createStore = async (req, res, next) => {
  try {
    const store = await storeService.createStore(req.body);

    if (store.err) {
      res.status(store.status).json({ success: false, msg: store.err, status: store.status });
    } else {
      res.status(201).json({ success: true, result: store, status: 201 });
    }
  } catch (error) {
    next(error);
  }
};

const loginStore = async (req, res, next) => {
  try {
    const store = await storeService.loginStore(req.body);

    if (store.err) {
      return res.status(store.status).json({ success: false, msg: store.err, status: store.status });
    }
    res.status(200).json({ success: true, result: store, status: 200 });
  } catch (error) {
    next(error);
  }
};

const getLoggedInStore = async (req, res, next) => {
  // Call Get Logged in User function from userService
  try {
    const store = await storeService.getLoggedInStore(req.store.id);

    res.status(200).json({
      success: true,
      result: store,
      status: 200
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const updateStoreRequest = async (req, res, next) => {
  try {
    let storeID;
    if (req.store) storeID = req.store.id;
    if (req.query.storeID && req.admin) storeID = req.query.storeID;

    const store = await storeService.updateStoreRequest(storeID, req.body);

    if (store.err) {
      res.status(store.status).json({ success: false, msg: store.err, status: store.status });
    } else {
      res.status(200).json({ success: true, result: store, status: 200 });
    }
  } catch (error) {
    next(error);
  }
};

const updateStore = async (req, res, next) => {
  try {
    let storeID;
    if (req.store) storeID = req.store.id;
    if (req.query.storeID && req.admin) storeID = req.query.storeID;

    const store = await storeService.updateStore(storeID, req.body);

    if (store.err) {
      res.status(store.status).json({ success: false, msg: store.err, status: store.status });
    } else {
      res.status(200).json({ success: true, result: store, status: 200 });
    }
  } catch (error) {
    next(error);
  }
};

const addLabel = async (req, res, next) => {
  let storeID;
  if (req.store) storeID = req.store.id;
  if (req.query.storeID && req.admin) storeID = req.query.storeID;

  const store = await storeService.addLabel(storeID, req.body);
  if (store.err) {
    res.status(store.status).json({ success: false, msg: store.err, status: store.status });
  } else {
    res.status(200).json({ success: true, result: store });
  }
};

const getLabels = async (req, res, next) => {
  try {
    let storeID;
    if (req.store) storeID = req.store.id;
    if (req.query.storeID && req.admin) storeID = req.query.storeID;

    const store = await storeService.getLabels(storeID);
    if (store.err) {
      res.status(store.status).json({ success: false, msg: store.err, status: store.status });
    } else {
      res.status(200).json({ success: true, result: store, status: 200 });
    }
  } catch (error) {
    next(error);
  }
};

const getStore = async (req, res, next) => {
  try {
    const storeDetails = await storeService.getStore(req.params.storeId);

    res.status(200).json({ success: true, result: storeDetails, status: 200 });
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

    if (salesStats.err) { return res.status(salesStats.status).json({ success: false, msg: salesStats.err, status: salesStats.status }); }

    return res.status(200).json({ success: true, result: salesStats, status: 200 });
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
    res.status(200).json({ success: true, result: bestSellingItems, status: 200 });
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

    return res.status(200).json({
      success: true,
      result: { feedbacks, size: feedbacks.length, status: 200 },
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryList = async (req, res, next) => {
  try {
    const inventoryList = await storeService.getInventoryList(req.query);

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
  updateStoreRequest,
  addLabel,
  getLabels,
  getStore,
  getStoresNoGeo,
  getStoreSalesStats,
  bestSellers,
  getStoreFeedback,
  getInventoryList,
  updateStore
};
