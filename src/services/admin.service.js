import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import mongoose from "mongoose";
import Admin from "../models/admin.model";
import User from "../models/user.model";
import Store from "../models/store.model";
import Notification from "../models/notification.models";
import StoreUpdate from "../models/store-update.model";

import sendEmail, { sendStorePasswordResetConfirmationMail, sendStorePayoutApprovalMail, sendStoreUpdateRequestApprovalMail } from "../utils/sendMail";
import getJwt from "../utils/jwtGenerator";
import Transaction from "../models/transaction.model";
import Ledger from "../models/ledger.model";
import { createTransaction } from "./transaction.service";
import { initiateTransfer } from "./payment.service";
import Logistics from "../models/logistics-company.model";
import Rider from "../models/rider.model";

const getAdmins = async () => {
  const admins = await Admin.find();
  return admins;
};

const registerAdmin = async (params) => {
  const { username, password } = params;

  let admin = await Admin.findOne({ username });

  if (admin) {
    return { err: "Admin account already exists.", status: 409 };
  }

  // Create Admin Object
  admin = new Admin({
    username,
    password,
  });

  const salt = await bcrypt.genSalt(10);

  // Replace password from user object with encrypted one
  admin.password = await bcrypt.hash(password, salt);

  // Save user to db
  await admin.save();

  let token = await getJwt(admin.id, "admin");

  return token;
};

const loginAdmin = async (loginParam) => {
  const { username, password } = loginParam;
  // Find admin with email
  let admin = await Admin.findOne({ username });

  if (!admin) {
    return { err: "Admin not found.", status: 404 };
  }

  // Check if password matches with stored hash
  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    return { err: "The password entered is invalid, please try again.", status: 401 };
  }

  let token = await getJwt(admin.id, "admin");

  return token;
};

const getLoggedInAdmin = async (adminParam) => {
  const admin = await Admin.findById(adminParam).select("-password");

  return admin;
};

const createNotification = async (body) => {
  // const {
  //   title, message, description, rider
  // } = req.body;
  const notification = await Notification.create(body);

  return { notification };
};

const updateAdmin = async (updateParam, id) => {
  const { username, password } = updateParam;

  // Build Admin Object
  const adminFields = {};

  // Check for fields
  if (username) adminFields.username = username;
  if (password) {
    const salt = await bcrypt.genSalt(10);

    // Replace password from admin object with encrypted one
    adminFields.password = await bcrypt.hash(password, salt);
  }

  try {
    // Find admin from DB Collection
    let admin = await Admin.findById(id);

    if (!admin) return { msg: "Admin not found.", status: 404 };

    // Updates the admin Object with the changed values
    admin = await Admin.findByIdAndUpdate(
      id,
      { $set: adminFields },
      { omitUndefined: true, new: true, useFindAndModify: false }
    );

    return admin;
  } catch (err) {
    return err;
  }
};
const getResetPasswordRequests = async (urlParams) => {
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);
  let requests = await Store.find({
    $or: [
      { resetPassword: "initiated" },
      { resetPassword: "done" }
    ]
  })
    .sort("createdAt")
    .skip(skip)
    .limit(limit)
    .select("name email phone_number");

  return requests;
};
const resetStorePassword = async (storeEmail) => {
  // generates random unique id;
  let orderId = () => {
    let s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
      // return id of format 'resetpasswordaaaa'
    return `resetpassword${s4()}`;
  };
  const salt = await bcrypt.genSalt(10);
  let randomCode = orderId();
  const password = await bcrypt.hash(randomCode, salt);
  let store = await Store
    .findOneAndUpdate(
      { email: storeEmail, resetPassword: "initiated" },
      { $set: { resetPassword: "done", password } },
      { omitUndefined: true, new: true, useFindAndModify: false }

    );

  if (!store) return { error: "Store not found", status: 404 };
  await sendStorePasswordResetConfirmationMail(storeEmail, randomCode);
  return "Password has been reset for store";
};

const getAllStoresUpdateRequests = async (urlParams) => {
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);
  let requests = await StoreUpdate.find({})
    .sort("createdAt")
    .skip(skip)
    .limit(limit)
    .populate({ path: "store", select: "name" });

  return requests;
};

const toggleStoreActive = async (urlParams) => {
  const { storeId } = urlParams;
  const fetchStore = await Store.findById(storeId);
  if (!fetchStore) {
    return { err: "Store does not exists." };
  }
  let store = {};
  if (fetchStore.isActive) {
    store = await Store.findByIdAndUpdate(storeId, { isActive: false }, { new: true });
  }
  if (!fetchStore.isActive) {
    store = await Store.findByIdAndUpdate(storeId, { isActive: true }, { new: true });
  }

  return store;
};

const confirmStoreUpdate = async (storeID) => {
  // use service to update store profile
  // also use for legacy admin store profile update action

  let updateParams = await StoreUpdate.findOne({ store: storeID });
  // check if there are inputs to update
  if (!updateParams) return { err: "No pending update for this store.", status: 400 };
  const { newDetails } = updateParams;

  // get fields to update
  const {
    address,
    place_id,
    location,
    email,
    name,
    phone_number,
    category,
    tax,
    account_details
  } = newDetails;

  const updateParam = {};

  // Check for fields
  if (address && place_id) {
    updateParam.address = address;
    updateParam.place_id = place_id;
  }
  if (account_details.full_name) {
    // find store and populate account details with existing values
    let store = await Store.findById(storeID).select("account_details");
    updateParam.account_details = {
      account_balance: store.account_details.account_balance,
      total_credit: store.account_details.total_credit,
      total_debit: store.account_details.total_debit,
      account_number: account_details.account_number,
      full_name: account_details.full_name,
      bank_name: account_details.bank_name,
      bank_code: account_details.bank_code,

    };
  }

  if (location.type && location.coordinates.length > 0) updateParam.location = location;
  if (phone_number) updateParam.phone_number = phone_number;
  if (category) updateParam.category = category;
  if (name) updateParam.name = name;
  if (email) updateParam.email = email;
  if (tax) updateParam.tax = tax;

  // apply update to store
  let storeUpdateRequest = await Store.findByIdAndUpdate(
    storeID,
    { $set: updateParam, pendingUpdates: false },
    { omitUndefined: true, new: true, useFindAndModify: false }
  );

  // delete the store update
  if (storeUpdateRequest.pendingUpdates === false) {
    await StoreUpdate.deleteOne({ store: storeID });
    await sendStoreUpdateRequestApprovalMail(storeUpdateRequest.email);
  }
  return storeUpdateRequest;
};

const confirmStorePayout = async (storeId) => {
  let store = await Store.findById(storeId);
  let payout = await Transaction.find({
    ref: storeId,
    type: "Debit",
    status: "pending"
  });

  if (payout.length < 2) return { err: "No pending payout for this store.", status: 400 };

  let payload = {
    account_bank: store.account_details.bank_code,
    account_number: store.account_details.account_number,
    amount: Number(payout[0].amount) - Number(payout[0].fee),
    narration: storeId,
    currency: "NGN"
  };
  let request = await initiateTransfer(payload);
  // update store payout transaction status to approved
  await Transaction.updateMany(
    { ref: storeId, type: "Debit", status: "pending" },
    { $set: { status: "approved" } },
    { omitUndefined: true, new: true, useFindAndModify: false }
  );
  await sendStorePayoutApprovalMail(store.email, payload.amount);
  return request;
};

const confirmLogisticsPayout = async (companyId) => {
  let company = await Logistics.findById(companyId);
  let payout = await Transaction.find({
    ref: companyId,
    type: "Debit",
    status: "pending"
  });

  if (payout.length < 2) return { err: "No pending payout for this logistics company.", status: 400 };

  let payload = {
    account_bank: company.account_details.bank_code,
    account_number: company.account_details.account_number,
    amount: Number(payout[0].amount) - Number(payout[0].fee),
    narration: company._id,
    currency: "NGN"
  };
  let request = await initiateTransfer(payload);
  // update store payout transaction status to approved
  await Transaction.updateMany(
    { ref: company._id, type: "Debit", status: "pending" },
    { $set: { status: "approved" } },
    { omitUndefined: true, new: true, useFindAndModify: false }
  );
  return request;
};

const confirmRiderPayout = async (riderId) => {
  let rider = await Rider.findById(riderId);
  let payout = await Transaction.find({
    ref: riderId,
    type: "Debit",
    status: "pending"
  });

  if (payout.length < 2) return { err: "No pending payout for this rider.", status: 400 };

  let payload = {
    account_bank: rider.account_details.bank_code,
    account_number: rider.account_details.account_number,
    amount: Number(payout[0].amount) - Number(payout[0].fee),
    narration: rider._id,
    currency: "NGN"
  };
  let request = await initiateTransfer(payload);
  // update store payout transaction status to approved
  await Transaction.updateMany(
    { ref: rider._id, type: "Debit", status: "pending" },
    { $set: { status: "approved" } },
    { omitUndefined: true, new: true, useFindAndModify: false }
  );
  return request;
};
const createCompayLedger = async () => {
  let details = {
    account_name: "SoftShop Ledger",
  };
  let oldLedger = await Ledger.findOne({});
  if (oldLedger) {
    return { err: "Ledger already exists.", status: 400 };
  }
  let newLedger = new Ledger(details);
  await newLedger.save();
  return newLedger;
};

const getAllStores = async (urlParams) => {
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);

  delete urlParams.limit;
  delete urlParams.skip;
  delete urlParams.page;
  let condition = {};
  if (urlParams.isActive) {
    condition.isActive = urlParams.isActive;
  }
  const stores = await Store.find(condition)
    .skip(skip)
    .limit(limit);

  return { stores };
};

const getStoreById = async (storeId) => {
  const store = await Store.findById(storeId);
  if (!store) return { err: "Store not found." };

  return { store };
};

// Get all Users
const getUsers = async (urlParams) => {
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);

  delete urlParams.limit;
  delete urlParams.skip;
  delete urlParams.page;

  const users = await User.find(urlParams)
    .select("-password -orders -cart")
    .skip(skip)
    .limit(limit);

  return users;
};

const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .select("-password -orders -cart");
  if (!user) return { err: "User does not exist." };

  return { user };
};

export {
  getAdmins, registerAdmin, loginAdmin, getLoggedInAdmin, updateAdmin,
  resetStorePassword, confirmStoreUpdate, createNotification, confirmStorePayout,
  createCompayLedger, getAllStoresUpdateRequests, getResetPasswordRequests,
  toggleStoreActive, getAllStores, getUsers, getStoreById, getUserById, confirmLogisticsPayout, confirmRiderPayout
};
