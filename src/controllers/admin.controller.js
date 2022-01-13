import { validationResult } from "express-validator";

import * as adminService from "../services/admin.service";
import * as transactionService from "../services/transaction.service";

const getAdmins = async (req, res) => {
  try {
    const admins = await adminService.getAdmins();

    return res.status(200).json({ success: true, result: admins, status: 200 });
  } catch (error) {
    next(error);
  }
};

const registerAdmin = async (req, res, next) => {
  try {
    const token = await adminService.registerAdmin(req.body);

    if (token.err) {
      res.status(token.status).json({ success: false, msg: token.err, status: token.status });
    } else {
      res.status(201).json({ success: true, result: token, status: 201 });
    }
  } catch (error) {
    next(error);
  }
};

const loginAdmin = async (req, res, next) => {
  try {
    // Call Login function from adminService
    const token = await adminService.loginAdmin(req.body);

    if (token.err) {
      res.status(token.status).json({ success: false, msg: token.err, status: token.status });
    } else {
      res.status(200).json({ success: true, result: token, status: 200 });
    }
  } catch (error) {
    next(error);
  }
};

const getLoggedInAdmin = async (req, res, next) => {
  try {
    const admin = await adminService.getLoggedInAdmin(req.admin.id);

    res.status(200).json({ success: true, result: admin, status: 200 });
  } catch (error) {
    next(error);
  }
};

const updateAdmin = async (req, res, next) => {
  const admin = await adminService.updateAdmin(req.body, req.admin.id);

  if (admin.msg) {
    res.status(admin.status).json({ success: false, msg: admin.msg, status: admin.status });
  } else {
    res.status(200).json({ success: true, result: admin });
  }
};

const resetStorePassword = async (req, res, next) => {
  const request = await adminService.resetStorePassword(req.params.email);

  if (request.err) {
    return res.status(request.status).json({ success: false, msg: admin.msg, status: request.status });
  }
  res.status(200).json({ success: true, result: request, status: 200 });
};

const confirmStoreUpdate = async (req, res, next) => {
  try {
    const store = await adminService.confirmStoreUpdate(req.params.storeId);

    if (store.err) {
      res.status(store.status).json({ success: false, msg: store.err, status: store.status });
    } else {
      res.status(200).json({ success: true, result: store, status: 200 });
    }
  } catch (error) {
    next(error);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const result = await adminService.createNotification(req.body);

    if (result.err) {
      res.status(result.status).json({ success: false, msg: result.err, status: result.status });
    } else {
      res.status(200).json({ success: true, result: result.notification, status: 200 });
    }
  } catch (error) {
    next(error);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.createTransaction(req.body);

    if (transaction.err) {
      res.status(transaction.status).json({ success: false, msg: transaction.err, status: transaction.status });
    } else {
      res.status(200).json({ success: true, result: transaction, status: 200 });
    }
  } catch (error) {
    next(error);
  }
};

const confirmStorePayout = async (req, res, next) => {
  try {
    const transaction = await adminService.confirmStorePayout(req.params.storeId);

    if (transaction.err) {
      res.status(transaction.status).json({ success: false, msg: transaction.err, status: transaction.status });
    } else {
      res.status(200).json({ success: true, result: transaction, status: 200 });
    }
  } catch (error) {
    next(error);
  }
};

const createCompayLedger = async (req, res, next) => {
  try {
    const ledger = await adminService.createCompayLedger(req.params.storeId);
    res.status(200).json({ success: true, result: ledger, status: 200 });
  } catch (error) {
    next(error);
  }
};

export {
  getAdmins, registerAdmin, loginAdmin, getLoggedInAdmin, updateAdmin, resetStorePassword, confirmStoreUpdate, createNotification, createTransaction, confirmStorePayout, createCompayLedger
};
