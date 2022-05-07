import { validationResult } from "express-validator";

import * as adminService from "../services/admin.service";
import * as emailService from "../services/email.service";
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

const getAllStoresUpdateRequests = async (req, res, next) => {
  try {
    const store = await adminService.getAllStoresUpdateRequests(req.query);

    if (store.err) {
      res.status(store.status).json({ success: false, msg: store.err, status: store.status });
    } else {
      res.status(200).json({ success: true, result: store, status: 200 });
    }
  } catch (error) {
    next(error);
  }
};

const getResetPasswordRequests = async (req, res, next) => {
  try {
    const request = await adminService.getResetPasswordRequests(req.query);

    res.status(200).json({ success: true, result: request, status: 200 });
  } catch (error) {
    next(error);
  }
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
      res.status(transaction.status).json({
        success: false, msg: transaction.err, data: transaction.data, status: transaction.status
      });
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

    if (ledger.err) {
      res.status(ledger.status).json({ success: false, msg: ledger.err, status: ledger.status });
    }
    res.status(200).json({ success: true, result: ledger, status: 200 });
  } catch (error) {
    next(error);
  }
};

const toggleStore = async (req, res, next) => {
  try {
    const store = await adminService.toggleStoreActive(req.params);
    res.status(200).json({ success: true, result: store, status: 200 });
  } catch (error) {
    next(error);
  }
};

const getAllStores = async (req, res, next) => {
  try {
    const stores = await adminService.getAllStores(req.query);
    res.status(200).json({
      success: true, result: stores, size: stores.length, status: 200
    });
  } catch (error) {
    next(error);
  }
};
// ========================================================================== //

const getUsers = async (req, res, next) => {
  try {
    const users = await adminService.getUsers(req.query);

    return res.status(200).json({
      success: true, result: users, size: users.length, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getUserById(req.params.userId);

    return res.status(200).json({
      success: true, result: user, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const getStoreById = async (req, res, next) => {
  try {
    const store = await adminService.getStoreById(req.params.storeId);

    return res.status(200).json({
      success: true, result: store, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const sendRiderMail = async (req, res, next) => {
  try {
    const rider = await emailService.sendRiderEmail(req.params.riderId, req.body);

    return res.status(200).json({
      success: true, result: rider, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const sendUserMail = async (req, res, next) => {
  try {
    const user = await emailService.sendUserEmail(req.params.userId, req.body);

    return res.status(200).json({
      success: true, result: user, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const sendStoreMail = async (req, res, next) => {
  try {
    const store = await emailService.sendStoreEmail(req.params.storeId, req.body);

    return res.status(200).json({
      success: true, result: store, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const sendAllStoresMails = async (req, res, next) => {
  try {
    const stores = await emailService.sendAllStoresEmails(req.body);

    return res.status(200).json({
      success: true, result: stores, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const sendAllUsersMails = async (req, res, next) => {
  try {
    const users = await emailService.sendAllUsersEmails(req.body);

    return res.status(200).json({
      success: true, result: users, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const sendAllRidersMails = async (req, res, next) => {
  try {
    const riders = await emailService.sendAllRidersEmails(req.body);

    return res.status(200).json({
      success: true, result: riders, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const sendAllMails = async (req, res, next) => {
  try {
    const data = await emailService.sendAllEmails(req.body);

    return res.status(200).json({
      success: true, result: data, status: 200
    });
  } catch (error) {
    next(error);
  }
};

export {
  getAdmins, registerAdmin, loginAdmin, getLoggedInAdmin, updateAdmin,
  resetStorePassword, confirmStoreUpdate, createNotification, createTransaction,
  confirmStorePayout, createCompayLedger, getAllStoresUpdateRequests,
  getResetPasswordRequests, toggleStore, getAllStores, getUsers, getUserById,
  getStoreById, sendRiderMail, sendStoreMail, sendUserMail, sendAllStoresMails,
  sendAllRidersMails, sendAllUsersMails, sendAllMails
};
