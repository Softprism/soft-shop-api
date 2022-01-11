import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import mongoose from "mongoose";
import Admin from "../models/admin.model";
import Store from "../models/store.model";
import StoreUpdate from "../models/store-update.model";

import sendEmail from "../utils/sendMail";
import getJwt from "../utils/jwtGenerator";
import Transaction from "../models/transaction.model";

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
const resetStorePassword = async (storeEmail) => {
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash("mysoftshopstore", salt);
  let store = await Store
    .findOneAndUpdate(
      { email: storeEmail },
      { $set: { resetPassword: true, password } },
      { omitUndefined: true, new: true, useFindAndModify: false }

    );

  if (!store) return { error: "Store not found", status: 404 };
  sendEmail(
    storeEmail,
    "Reset Password Successful",
    "Your reset password request has been approved, please sign in to your account with <b> mysoftshopstore </b> as your password. Reset your password afterwards"
  );
  return "Password has been reset for store";
};

const confirmStoreUpdate = async (storeID) => {
  // use service to update store profile
  // also use for legacy admin store profile update action

  let updateParams = await StoreUpdate.findOne({ store: storeID }).select("newDetails");

  // check if there are inputs to update
  if (!updateParams) return { err: "You haven't specified a field to update. Please try again.", status: 400 };
  const { newDetails } = updateParams;

  // get fields to update
  const {
    address,
    location,
    email,
    name,
    phone_number,
    category,
    tax
  } = newDetails;

  const updateParam = {};

  // Check for fields
  if (address) updateParam.address = address;
  if (location.type && location.coordinates.length > 0) updateParam.location = location;
  if (phone_number) updateParam.phone_number = phone_number;
  if (category) updateParam.category = category;
  if (name) updateParam.name = name;
  if (email) updateParam.email = email;
  if (tax) updateParam.tax = tax;

  // apply update to store
  let storeUpdateRequest = await Store.findByIdAndUpdate(
    storeID,
    { $set: updateParam },
    { omitUndefined: true, new: true, useFindAndModify: false }
  );
  // change updateDetails checker in store model to false if update request was successful
  if (storeUpdateRequest) {
    storeUpdateRequest.pendingUpdates = false;
    storeUpdateRequest.save();
    await StoreUpdate.findByIdAndDelete(updateParams._id);
  }

  return storeUpdateRequest;
};

const confirmStorePayout = async (storeId) => {
  let store = await Store.findById(storeId);
  let transactions = await Transaction.aggregate()
    .match({
      receiver: mongoose.Types.ObjectId(storeId),
    })
    .group({
      _id: "$receiver",
      totalCredit: {
        $sum: {
          $cond:
       [{ $eq: ["$type", "Credit"] }, "$amount", 0]
        }
      },
      totalDebit: {
        $sum: {
          $cond:
       [{ $eq: ["$type", "Debit"] }, "$amount", 0]
        }
      }
    });

  let totalStoreCredits = Number(store.account_details.total_credit);
  let totalStoreDebits = Number(store.account_details.total_debit);
  let totalTransactionCredits = Number(transactions[0].totalCredit);
  let totalTransactionDebits = Number(transactions[0].totalDebit);

  if (totalStoreCredits === totalTransactionCredits && totalTransactionDebits === totalStoreDebits) {
    let approval = await Transaction.findOne({ receiver: storeId, status: "pending" });
    approval.status = "completed";
    approval.save();
    return approval;
  }
  return { err: "Store money not consistent. Please pull transaction records.", status: 400 };
};

export {
  getAdmins, registerAdmin, loginAdmin, getLoggedInAdmin, updateAdmin, resetStorePassword, confirmStoreUpdate, createNotification, confirmStorePayout
};
