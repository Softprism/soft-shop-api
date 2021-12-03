import * as storeService from "../services/store.service.js";
import { validationResult } from "express-validator";

const getStores = async (req, res, next) => {
  const stores = await storeService.getStores(req.query);

  stores && stores.length > 0
    ? res.status(200).json({ success: true, result: stores })
    : res.status(404).json({ success: false, msg: "No Store found" });
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
    res.status(409).json({ success: false, msg: store.err });
  } else {
    res.status(201).json({ success: true, result: store });
  }
};

const loginStore = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors,
    });
  }

  const store = await storeService.loginStore(req.body);

  if (store.err) {
    console.log(store.err.msg);
    return res.status(403).json({ success: false, msg: store.err });
  } else {
    res.status(200).json({ success: true, result: store });
  }
};

const getLoggedInStore = async (req, res, next) => {
  // Call Get Logged in User function from userService
  const store = await storeService.getLoggedInStore(req.store.id);

  if (store.err) {
    res.status(500).json({ success: false, msg: store.err });
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
      errors: errors.array()["msg"],
    });
  }

  let storeID;
  if (req.store) storeID = req.store.id;
  if (req.query.storeID && req.admin) storeID = req.query.storeID;

  const store = await storeService.updateStore(storeID, req.body);

  if (store.err) {
    res.status(500).json({ success: false, msg: store.err });
  } else {
    res.status(200).json({ success: true, result: store });
  }
};

const addLabel = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array()["msg"],
    });
  }

  let storeID;
  if (req.store) storeID = req.store.id;
  if (req.query.storeID && req.admin) storeID = req.query.storeID;

  const store = await storeService.addLabel(storeID, req.body);
  console.log(req.body);
  if (store.err) {
    res.status(500).json({ success: false, msg: store.err });
  } else {
    res.status(200).json({ success: true, result: store });
  }
};

const getLabels = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array()["msg"],
    });
  }

  let storeID;
  if (req.store) storeID = req.store.id;
  if (req.query.storeID && req.admin) storeID = req.query.storeID;

  const store = await storeService.getLabels(storeID);
  if (store.err) {
    res.status(500).json({ success: false, msg: store.err });
  } else {
    res.status(200).json({ success: true, result: store });
  }
};

const getStore = async (req, res, next) => {
  const storeDetails = await storeService.getStore(req.params.storeId);

  if (storeDetails.err) {
    return res.status(403).json({ success: false, msg: storeDetails.err });
  } else {
    res.status(200).json({ success: true, result: storeDetails });
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
};
