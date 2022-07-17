import { validationResult } from "express-validator";
import Admin from "../models/admin.model";
import Roles from "../models/user-roles.model";
import { createActivity } from "../services/activities.service";

import * as adminService from "../services/admin.service";
import * as emailService from "../services/email.service";
import * as transactionService from "../services/transaction.service";
import { sendStoreSignUpFollowUpMail, sendWaitListInvite } from "../utils/sendMail";

const getAdmins = async (req, res, next) => {
  try {
    const admins = await adminService.getAdmins(req.query);

    return res.status(200).json({
      success: true, result: admins, size: admins.length, status: 200
    });
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

      // log activity
      let admin = await Admin.findOne({ email: req.body.email });
      await createActivity(
        "Admin",
        admin._id,
        "Signed up",
        `Admin with role ${admin.email} logged in`
      );
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

      // create activity log
      let admin = await Admin.findOne({ email: req.body.email }).populate("role");
      await createActivity(
        "Admin",
        admin._id,
        "Logged in",
        `Admin with role ${admin.role.name} logged in`
      );
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
  const admin = await adminService.updateAdmin(req.body, req.params.id);

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
    let transaction;
    if (req.query.storeId) {
      transaction = await adminService.confirmStorePayout(req.query.storeId);
    }
    if (req.query.companyId) {
      transaction = await adminService.confirmLogisticsPayout(req.query.companyId);
    }
    if (req.query.riderId) {
      transaction = await adminService.confirmRiderPayout(req.query.riderId);
    }
    console.log(transaction);
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
      success: true, result: stores.stores, size: stores.stores.length, status: 200
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
    if (user.err) {
      res.status(user.status).json({ success: false, msg: user.err, status: user.status });
    }
    return res.status(200).json({
      success: true, result: user.user[0], status: 200
    });
  } catch (error) {
    next(error);
  }
};

const getStoreById = async (req, res, next) => {
  try {
    const store = await adminService.getStoreById(req.params.storeId);
    if (store.err) {
      res.status(store.status).json({ success: false, msg: store.err, status: store.status });
    }
    return res.status(200).json({
      success: true, result: store.store, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const getRiderById = async (req, res, next) => {
  try {
    const rider = await adminService.getRiderById(req.params.riderId);
    if (rider.err) {
      res.status(rider.status).json({ success: false, msg: rider.err, status: rider.status });
    }
    return res.status(200).json({
      success: true, result: rider, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const getAllRiders = async (req, res, next) => {
  try {
    const riders = await adminService.getRiders(req.query);
    return res.status(200).json({
      success: true, result: riders, size: riders.length, status: 200
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

const sendStoreSignUpFollowUpMailCtrl = async (req, res, next) => {
  try {
    const store = await sendStoreSignUpFollowUpMail(req.body);

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

const confirmLogisticsPayout = async (req, res, next) => {
  try {
    const transaction = await adminService.confirmStorePayout(req.params.companyId);

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

const inviteUsersToBeta = async (req, res, next) => {
  try {
    const action = await sendWaitListInvite(req.body.emails);

    return res.status(200).json({
      success: true, result: action, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const confirmRiderAccountDetails = async (req, res, next) => {
  try {
    const action = await adminService.confirmRiderAccountDetails(req.params.riderId);

    return res.status(200).json({
      success: true, result: action, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const confirmLogisticsAccountDetails = async (req, res, next) => {
  try {
    const action = await adminService.confirmLogisticsAccountDetails(req.params.companyId);

    return res.status(200).json({
      success: true, result: action, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const addUserDiscount = async (req, res, next) => {
  try {
    const discount = await adminService.addUserDiscount(req.body);

    if (discount.err) {
      return res.status(discount.status).json({ success: false, msg: discount.err, status: discount.status });
    }

    res.status(200).json({ success: true, result: discount, status: 200 });
  } catch (error) {
    next(error);
  }
};

const getDeletionRequests = async (req, res, next) => {
  try {
    const requests = await adminService.getDeletionRequests(req.query);

    return res.status(200).json({
      success: true, result: requests, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const createRoles = async (req, res, next) => {
  try {
    const action = await adminService.createRoles();

    if (action.err) {
      return res.status(action.status).json({ success: false, msg: action.err, status: action.status });
    }

    res.status(200).json({ success: true, result: action, status: 200 });
  } catch (error) {
    next(error);
  }
};

const getRoles = async (req, res, next) => {
  try {
    const roles = await adminService.getRoles(req.query);

    if (roles.err) {
      return res.status(roles.status).json({ success: false, msg: roles.err, status: roles.status });
    }

    res.status(200).json({
      success: true, result: roles, size: roles.length, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const approveDeleteRquest = async (req, res, next) => {
  try {
    const action = await adminService.approveDeleteRquest(req.params.id);

    if (action.err) {
      return res.status(action.status).json({ success: false, msg: action.err, status: action.status });
    }

    return res.status(200).json({
      success: true, result: action, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const getRole = async (req, res, next) => {
  try {
    const role = await adminService.getRole(req.params.roleId);

    if (role.err) {
      return res.status(roles.status).json({ success: false, msg: role.err, status: role.status });
    }

    res.status(200).json({
      success: true, result: role[0], status: 200

    });
  } catch (error) {
    next(error);
  }
};

export {
  getAdmins,
  registerAdmin,
  loginAdmin,
  getLoggedInAdmin,
  updateAdmin,
  resetStorePassword,
  confirmStoreUpdate,
  createNotification,
  createTransaction,
  confirmStorePayout,
  createCompayLedger,
  getAllStoresUpdateRequests,
  getResetPasswordRequests,
  toggleStore,
  getAllStores,
  getUsers,
  getUserById,
  getStoreById,
  sendRiderMail,
  sendStoreMail,
  sendUserMail,
  sendAllStoresMails,
  sendAllRidersMails,
  sendAllUsersMails,
  sendAllMails,
  confirmLogisticsPayout,
  inviteUsersToBeta,
  confirmRiderAccountDetails,
  confirmLogisticsAccountDetails,
  addUserDiscount,
  sendStoreSignUpFollowUpMailCtrl,
  getDeletionRequests,
  approveDeleteRquest,
  createRoles,
  getRoles,
  getRole,
  getRiderById,
  getAllRiders
};
