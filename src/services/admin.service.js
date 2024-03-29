import bcrypt from "bcryptjs";

import mongoose, { Mongoose } from "mongoose";
import Admin from "../models/admin.model";
import User from "../models/user.model";
import Store from "../models/store.model";
import Notification from "../models/notification.models";
import StoreUpdate from "../models/store-update.model";

import {
  sendStorePasswordResetConfirmationMail,
  sendStoreUpdateRequestApprovalMail,
} from "../utils/sendMail";
import getJwt from "../utils/jwtGenerator";
import Transaction from "../models/transaction.model";
import Ledger from "../models/ledger.model";
import { initiateTransfer } from "./payment.service";
import Logistics from "../models/logistics-company.model";
import Rider from "../models/rider.model";
import { sendMany } from "./push.service";
import UserDiscount from "../models/user-discount.model";

import Deletion from "../models/delete-requests.model";

import Roles from "../models/user-roles.model";
import { getLoggedInStore, getStoresNoGeo } from "./store.service";
import { allUserProfiles, getLoggedInUser } from "./user.service";
import { getAllRiders, loggedInRider } from "./rider.service";
import Order from "../models/order.model";
import Referral from "../models/referral.model";

const getAdmins = async (urlParams) => {
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);

  delete urlParams.limit;
  delete urlParams.skip;
  delete urlParams.page;

  const admins = await Admin.find(urlParams)
    .populate({ path: "role", select: "name level" })
    .select("first_name last_name email image phone_number createdDate")
    .sort("createdDate")
    .skip(skip)
    .limit(limit);
  return admins;
};

const registerAdmin = async (params) => {
  const {
    email, password, first_name, last_name, image, role, phone_number
  } = params;

  let admin = await Admin.findOne({ email });

  if (admin) {
    return { err: "Admin account already exists.", status: 409 };
  }

  // Create Admin Object
  admin = new Admin({
    email,
    password,
    first_name,
    last_name,
    image,
    role,
    phone_number
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
  const { email, password } = loginParam;
  // Find admin with email
  let admin = await Admin.findOne({ email });

  if (!admin) {
    return { err: "Admin account not found.", status: 404 };
  }

  // Check if password matches with stored hash
  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    return {
      err: "The password entered is invalid, please try again.",
      status: 401,
    };
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
  const {
    email, password, first_name, last_name, image, role, phone_number, verified
  } = updateParam;

  // Build Admin Object
  const adminFields = {};

  // Check for fields
  if (email) adminFields.email = email;
  if (first_name) adminFields.first_name = first_name;
  if (last_name) adminFields.last_name = last_name;
  if (image) adminFields.image = image;
  if (phone_number) adminFields.phone_number = phone_number;
  if (verified) adminFields.verified = verified;

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
    $or: [{ resetPassword: "initiated" }, { resetPassword: "done" }],
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
  let store = await Store.findOneAndUpdate(
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
    return { err: "Store does not exists.", status: 400 };
  }
  let store = {};
  if (fetchStore.isActive) {
    store = await Store.findByIdAndUpdate(
      storeId,
      { isActive: false },
      { new: true }
    );
  }
  if (!fetchStore.isActive) {
    store = await Store.findByIdAndUpdate(
      storeId,
      { isActive: true },
      { new: true }
    );
  }

  return store;
};

const confirmStoreUpdate = async (storeID) => {
  // use service to update store profile
  // also use for legacy admin store profile update action

  let updateParams = await StoreUpdate.findOne({ store: storeID });
  // check if there are inputs to update
  if (!updateParams) {
    return { err: "No pending update for this store.", status: 400 };
  }
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
    account_details,
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

  if (location.type && location.coordinates.length > 0) {
    updateParam.location = location;
  }
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
  let payout = await Transaction.findOne({
    ref: storeId,
    type: "Debit",
    status: "pending",
  });

  if (!payout) return { err: "No pending payout for this store.", status: 400 };

  // create withdrawal reference
  let ref = () => {
    let s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
    // return id of format 'card - aaaaa'
    return `store ${s4()}`;
  };
  let payload = {
    account_bank: store.account_details.bank_code,
    account_number: store.account_details.account_number,
    amount: Number(payout.amount) - Number(payout.fee),
    narration: storeId,
    reference: ref(),
    currency: "NGN",
  };
  let request = await initiateTransfer(payload);
  // update store payout transaction status to approved
  await Transaction.findOneAndUpdate(
    { ref: storeId, type: "Debit", status: "pending" },
    { $set: { status: "approved" } },
    { omitUndefined: true, new: true, useFindAndModify: false }
  );
  // send push notification to store vendorPushDeviceToken
  await sendMany(
    "ssa",
    store.vendorPushDeviceToken,
    "Payout Request Approved!",
    `Your request to withdraw ₦${payload.amount} has been approved`
  );
  // await sendStorePayoutApprovalMail(store.email, payload.amount);
  return request;
};

const confirmLogisticsPayout = async (companyId) => {
  let company = await Logistics.findById(companyId);
  let payout = await Transaction.findOne({
    ref: companyId,
    type: "Debit",
    status: "pending",
  });

  if (!payout) {
    return {
      err: "No pending payout for this logistics company.",
      status: 400,
    };
  }

  // create withdrawal reference
  let ref = () => {
    let s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
    // return id of format 'card - aaaaa'
    return `logistics ${s4()}`;
  };

  let payload = {
    account_bank: company.account_details.bank_code,
    account_number: company.account_details.account_number,
    amount: Number(payout.amount) - Number(payout.fee),
    narration: company._id,
    reference: ref(),
    currency: "NGN",
  };
  let request = await initiateTransfer(payload);
  // update store payout transaction status to approved
  await Transaction.findOneAndUpdate(
    { ref: company._id, type: "Debit", status: "pending" },
    { $set: { status: "approved" } },
    { omitUndefined: true, new: true, useFindAndModify: false }
  );
  return request;
};

const confirmRiderPayout = async (riderId) => {
  let rider = await Rider.findById(riderId);
  let payout = await Transaction.findOne({
    ref: riderId,
    type: "Debit",
    status: "pending",
  });

  if (!payout) return { err: "No pending payout for this rider.", status: 400 };

  // create withdrawal reference
  let ref = () => {
    let s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
    // return id of format 'card - aaaaa'
    return `rider ${s4()}`;
  };
  let payload = {
    account_bank: rider.account_details.bank_code,
    account_number: rider.account_details.account_number,
    amount: Number(payout.amount) - Number(payout.fee),
    narration: rider._id,
    reference: ref(),
    currency: "NGN",
  };
  let request = await initiateTransfer(payload);
  // update store payout transaction status to approved
  await Transaction.findOneAndUpdate(
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
  // const limit = Number(urlParams.limit);
  // const skip = Number(urlParams.skip);

  // delete urlParams.limit;
  // delete urlParams.skip;
  // delete urlParams.page;
  // let condition = {};
  // if (urlParams.isActive) {
  //   condition.isActive = urlParams.isActive;
  // }
  const stores = await getStoresNoGeo(urlParams);
  // Store.find(condition).skip(skip).limit(limit);

  return { stores };
};

const getStoreById = async (storeId) => {
  const store = await getLoggedInStore(storeId);
  return { store };
};

// Get all Users
const getUsers = async (urlParams) => {
  // const limit = Number(urlParams.limit);
  // const skip = Number(urlParams.skip);

  // delete urlParams.limit;
  // delete urlParams.skip;
  // delete urlParams.page;

  const users = await allUserProfiles(urlParams);
  // await User.find(urlParams)
  //   .select("-password -orders -cart")
  //   .skip(skip)
  //   .limit(limit);

  return users;
};

const getUserById = async (userId) => {
  const user = await getLoggedInUser(userId);
  if (user.length === 0) {
    return { err: "user not found", status: 404 };
  }
  return { user };
};

const getRiders = async (urlParams) => {
  let riders = await getAllRiders(urlParams);
  return riders;
};

const getRiderById = async (riderId) => {
  let rider = await loggedInRider(riderId);
  return rider;
};

const confirmRiderAccountDetails = async (riderId) => {
  // approves or disapproves the rider account details
  let rider = await Rider.findById(riderId);
  // check if rider exist
  if (!rider) return { err: "Rider does not exist.", status: 404 };

  // check if account details field exists
  if (!rider.account_details) {
    return { err: "Account details not found.", status: 400 };
  }

  rider.account_details.isVerified = !rider.account_details.isVerified;
  await rider.save();
  return rider;
};

const confirmLogisticsAccountDetails = async (companyId) => {
  // approves or disapproves the company account details
  let company = await Logistics.findById(companyId);
  // check if rider exist
  if (!company) return { err: "Company does not exist.", status: 404 };

  // check if account details field exists
  if (!company.account_details) {
    return { err: "Account details not found.", status: 400 };
  }

  company.account_details.isVerified = !company.account_details.isVerified;
  await company.save();
  return company;
};
const addUserDiscount = async ({
  userId,
  vendorId,
  discount,
  discountType,
  limit
}) => {
  if (userId) {
    let user = await User.findById(userId);
    if (!user) return { err: "User does not exist.", status: 404 };
  } else if (vendorId) {
    let store = await Store.findById(vendorId);
    if (!store) return { err: "store does not exist.", status: 404 };
  }

  if (!limit) limit = 1;

  let discountObj = {
    user: userId,
    vendor: vendorId,
    discount,
    discountType,
    limit
  };
  let newDiscount = new UserDiscount(discountObj);
  await newDiscount.save();
  return newDiscount;
};

const getDeletionRequests = async (urlParams) => {
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);

  delete urlParams.limit;
  delete urlParams.skip;
  delete urlParams.page;

  const requests = await Deletion.find(urlParams)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return requests;
};

const approveDeleteRquest = async (requestId) => {
  // find which user the request is for
  let request = await Deletion.findById(requestId);
  if (!request) return { err: "Request does not exist.", status: 404 };

  // find the user
  switch (request.account_type) {
    case "User": {
      let user = await User.findById(request.account_id);
      if (!user) return { err: "User does not exist.", status: 404 };
      await User.findByIdAndDelete(request.account_id);
      break;
    }
    case "Rider": {
      let rider = await Rider.findById(request.account_id);
      if (!rider) return { err: "Rider does not exist.", status: 404 };
      await Rider.findByIdAndDelete(request.account_id);
      break;
    }
    case "logistics": {
      let logistics = await Logistics.findById(request.account_id);
      if (!logistics) return { err: "Logistics does not exist.", status: 404 };
      await Logistics.findByIdAndDelete(request.account_id);
      break;
    }
    case "Store": {
      let store = await Store.findById(request.account_id);
      if (!store) return { err: "Store does not exist.", status: 404 };
      await Store.findByIdAndDelete(request.account_id);
      break;
    }
    default:
      return { err: "Account type not found.", status: 400 };
  }
  await Deletion.findByIdAndDelete(requestId);
  return "Request approved successfully.";
};

const createRoles = async () => {
  let existingRoles = await Roles.find();

  // check if there are roles
  if (existingRoles.length > 1) {
    return {
      err: "This action can only be performed once, Delete all roles and try again",
      status: 400,
    };
  }

  // create new roles
  await Roles.create([
    { name: "admin", level: 1 },
    { name: "owner", level: 2 },
    { name: "finance", level: 3 },
    { name: "support", level: 4 },
    { name: "logistics", level: 2 },
  ]);

  return "Roles created successfully";
};

const getRoles = async (urlParams) => {
  // setting pagination params
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);
  // declare fields to remove after aggregating
  const pipeline = [
    {
      $unset: ["admins"],
    },
  ];

  const roles = await Roles.aggregate()
    .lookup({
      from: "admins",
      localField: "_id",
      foreignField: "role",
      as: "admins"
    })
    .addFields({
      teamMembers: { $size: "$admins" }
    })
    .sort("level")
    .skip(skip)
    .limit(limit)
    // appends the pipeline specified above
    .append(pipeline);

  return roles;
};

const getRole = async (id) => {
  // declare fields to remove after aggregating
  const pipeline = [
    {
      $unset: ["admins.password"],
    },
  ];

  const role = await Roles.aggregate()
    .match({
      _id: mongoose.Types.ObjectId(id)
    })
    // .lookup({
    //   from: "admins",
    //   localField: "_id",
    //   foreignField: "role",
    //   as: "admins"
    // })
    // appends the pipeline specified above
    .append(pipeline);

  return role;
};

const storeSignUpStats = async (days) => {
  if (!days) return { err: "Please, specify amount of days to get stats for.", status: 400 };

  let d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(23);
  d.setMinutes(59);
  d.setSeconds(59);

  let stores = await Store.aggregate()
    .match({
      isVerified: true,
      createdAt: { $gt: d },
    })
    .addFields({
      dayOfSignUp: { $dayOfWeek: "$createdAt" },
      dateOfSignUp: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
    })
    .group({
      _id: "$dateOfSignUp",
      signUps: { $push: "$_id" },
    })
    .addFields({
      weekday: { $dayOfWeek: { $dateFromString: { dateString: "$_id" } } },
      weekdate: "$_id",
      // totalSales: { $sum: "$sales" },
      totalSignUps: { $size: "$signUps" },
    })
    .sort("weekday")
    .project({
      _id: 0,
      sales: 0,
    });

  return stores;
};

const riderSignUpStats = async (days) => {
  if (!days) return { err: "Please, specify amount of days to get stats for.", status: 400 };

  let d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(23);
  d.setMinutes(59);
  d.setSeconds(59);

  let riders = await Rider.aggregate()
    .match({
      isVerified: true,
      createdDate: { $gt: d },
    })
    .addFields({
      dayOfSignUp: { $dayOfWeek: "$createdDate" },
      dateOfSignUp: { $dateToString: { format: "%Y-%m-%d", date: "$createdDate" } }
    })
    .group({
      _id: "$dateOfSignUp",
      signUps: { $push: "$_id" },
    })
    .addFields({
      weekday: { $dayOfWeek: { $dateFromString: { dateString: "$_id" } } },
      weekdate: "$_id",
      // totalSales: { $sum: "$sales" },
      totalSignUps: { $size: "$signUps" },
    })
    .sort("weekday")
    .project({
      _id: 0,
      sales: 0,
    });
  return riders;
};

const userSignUpStats = async (days) => {
  if (!days) return { err: "Please, specify amount of days to get stats for.", status: 400 };

  let d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(23);
  d.setMinutes(59);
  d.setSeconds(59);

  let users = await User.aggregate()
    .match({
      isVerified: true,
      createdDate: { $gt: d },
    })
    .addFields({
      dayOfSignUp: { $dayOfWeek: "$createdDate" },
      dateOfSignUp: { $dateToString: { format: "%Y-%m-%d", date: "$createdDate" } }
    })
    .group({
      _id: "$dateOfSignUp",
      signUps: { $push: "$_id" },
    })
    .addFields({
      weekday: { $dayOfWeek: { $dateFromString: { dateString: "$_id" } } },
      weekdate: "$_id",
      // totalSales: { $sum: "$sales" },
      totalSignUps: { $size: "$signUps" },
    })
    .sort("weekday")
    .project({
      _id: 0,
      sales: 0,
    });
  return users;
};

const completedOrderStats = async (days) => {
  if (!days) return { err: "Please, specify amount of days to get stats for.", status: 400 };

  let d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(23);
  d.setMinutes(59);
  d.setSeconds(59);

  let completedOrders = await Order.aggregate()
    .match({
      // store: mongoose.Types.ObjectId(storeId),
      status: "delivered",
      createdAt: { $gt: d },
    })
    .addFields({
      dayOfOrder: { $dayOfWeek: "$createdAt" },
      dateOfOrder: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } }
    })
    .group({
      _id: "$dateOfOrder",
      orders: { $push: "$_id" },
    })
    .addFields({
      weekday: { $dayOfWeek: { $dateFromString: { dateString: "$_id" } } },
      weekdate: "$_id",
      // totalSales: { $sum: "$sales" },
      totalOrders: { $size: "$orders" },
    })
    .sort("weekday")
    .project({
      _id: 0,
      orders: 0,
    });

  return completedOrders;
};

const completedSalesStats = async (days) => {
  if (!days) return { err: "Please, specify amount of days to get stats for.", status: 400 };

  let d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(23);
  d.setMinutes(59);
  d.setSeconds(59);

  let completedSales = await Order.aggregate()
    .match({
      // store: mongoose.Types.ObjectId(storeId),
      status: "delivered",
      createdAt: { $gt: d },
    })
    .addFields({
      dayOfOrder: { $dayOfWeek: "$createdAt" },
      dateOfOrder: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } }
    })
    .group({
      _id: "$dateOfOrder",
      sales: { $push: "$totalPrice" },
    })
    .addFields({
      weekday: { $dayOfWeek: { $dateFromString: { dateString: "$_id" } } },
      weekdate: "$_id",
      totalSales: { $sum: "$sales" },
      // totalOrders: { $size: "$orders" },
    })
    .sort("weekday")
    .project({
      _id: 0,
      sales: 0,
    });

  return completedSales;
};

const statsOverview = async () => {
  const totalStores = await Store.find({ isVerified: true });
  const totalUsers = await User.find({ isVerified: true });
  const totalRiders = await Rider.find({ isVerified: true });
  const totalOrders = await Order.find({ status: "delivered" });
  const totalSales = await Order.aggregate()
    .match({
      status: "delivered",
    })
    .group({
      _id: "$status",
      sales: { $push: "$totalPrice" },
    })
    .addFields({
      totalSales: { $sum: "$sales" },
    })
    .project({
      _id: 0,
    });
  return {
    totalOrders, totalRiders, totalStores, totalUsers, totalSales
  };
};

const incomeChecker = async () => {
  const ledger = await Ledger.findOne({}).select("-createdDate -_id -__v");
  return ledger;
};

const createReferralAccount = async (userId) => {
  // check if user has referral code
  let checkUser = await User.findById(userId);
  if (checkUser.referral_id) {
    return { err: "This user has been signed up on the referral program", status: 400 };
  }
  let ref_id = () => {
    let s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
    // return id of format 'soft - aaaaa'
    return `ref-${s4()}`;
  };
  let newReferralCode = ref_id();
  // check if user exists and generate referral code
  let user = await User.findByIdAndUpdate(
    { _id: userId },
    { $set: { referral_id: newReferralCode } },
    { omitUndefined: true, new: true, useFindAndModify: false }
  );
  if (!user.referral_id) {
    return { err: "Error updating this user's account, user may not exist.", status: 400 };
  }

  // create account on referral model
  await Referral.create({
    referral_id: newReferralCode,
    reffered: [],
    account_balance: 0.00
  });
  return "Referral Account created successfully";
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
  confirmStorePayout,
  createCompayLedger,
  getAllStoresUpdateRequests,
  getResetPasswordRequests,
  toggleStoreActive,
  getAllStores,
  getUsers,
  getStoreById,
  getUserById,
  confirmLogisticsPayout,
  confirmRiderPayout,
  confirmRiderAccountDetails,
  confirmLogisticsAccountDetails,
  addUserDiscount,
  getDeletionRequests,
  approveDeleteRquest,
  createRoles,
  getRoles,
  getRole,
  getRiderById,
  getRiders,
  storeSignUpStats,
  riderSignUpStats,
  userSignUpStats,
  completedOrderStats,
  completedSalesStats,
  statsOverview,
  incomeChecker,
  createReferralAccount
};
