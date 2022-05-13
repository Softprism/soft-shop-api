// import logistics model es6 destructuring
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import Logistics from "../models/logistics-company.model";
import Rider from "../models/rider.model";
import Transaction from "../models/transaction.model";
import getJwt from "../utils/jwtGenerator";
import { createTransaction } from "./transaction.service";

const getAllCompanies = async () => {
  // return all Logistics companies name
  const companies = await Logistics.find().select("-password").sort("-createdAt");
  return companies;
};
const companySignup = async (signupParams) => {
  // destructure  signupParams with variables in model
  const {
    email,
    companyName,
    image,
    companyAddress,
    location,
    placeId,
    password,
  } = signupParams;

  // check if company exists
  const companyExists = await Logistics.findOne({ email });
  if (companyExists) {
    return { err: "This company has been registered already", status: 401 };
  }

  // bcrypt password
  const hashedPassword = await bcrypt.hash(password, 10);

  // add destructured variables to new object
  const newCompany = {
    email,
    companyName,
    image,
    companyAddress,
    location,
    placeId,
    password: hashedPassword,
  };

  // create and save new logistics company
  const company = new Logistics(newCompany);
  let saveAction = await company.save();
  if (!saveAction) {
    return { err: "Something went wrong", status: 400 };
  }
  // Define payload for token
  let token = await getJwt(saveAction._id, "logistics");
  return { saveAction, token };
};

const companyLogin = async (loginParams) => {
  // destructure  loginParams with variables in model
  const { email, password } = loginParams;

  // check if company exists
  const companyExists = await Logistics.findOne({ email });
  if (!companyExists) {
    return { err: "This company does not exist", status: 401 };
  }

  // check if password is correct
  const isPasswordCorrect = await bcrypt.compare(password, companyExists.password);
  if (!isPasswordCorrect) {
    return { err: "Password is incorrect", status: 401 };
  }

  // Define payload for token
  let token = await getJwt(companyExists._id, "logistics");

  return { companyExists, token };
};

const companyDetails = async (id) => {
  // check if company exists
  const companyExists = await Logistics.findById(id).select("-password");
  if (!companyExists) {
    return { err: "This company does not exist", status: 401 };
  }
  // get all company's rider and amount of delivery of each rider using aggregate
  const data = await Logistics.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(id),
      },
    },
    // lookup riders with company_id
    {
      $lookup: {
        from: "riders",
        localField: "_id",
        foreignField: "company_id",
        as: "riders",
      },
    },
    {
      $lookup: {
        from: "deliveries",
        localField: "riders._id",
        foreignField: "rider",
        as: "deliveries",
      }
    },
    // count riders and deliveries
    {
      $addFields: {
        riderCount: {
          $size: "$riders",
        },
        deliveryCount: {
          $size: "$deliveries",
        },
      },
    },
    // hide riders and deliveries field
    {
      $project: {
        deliveries: 0,
        riders: 0,
      },
    },

  ]);

  // count amount of delivery of each rider
  // {
  //   $group: {
  //     _id: "$riders._id",
  //     rider: { $first: "$riders" },

  return data;
};

const updateCompanyAddress = async (id, locationParam) => {
  console.log(locationParam);
  // check if company exists
  const companyExists = await Logistics.findById(id);
  if (!companyExists) {
    return { err: "This company does not exist", status: 401 };
  }

  // destructure locationParam with variables in model
  const { location, companyAddress, placeId } = locationParam;
  location.type = "Point";

  // update company address
  const updateAction = await Logistics.findByIdAndUpdate(
    id,
    {
      $set: {
        location,
        companyAddress,
        placeId,
      },
    },
    { new: true }
  );
  if (!updateAction) {
    return { err: "Something went wrong", status: 400 };
  }
  return "Address Changed Successfully";
};

const updateLoginDetails = async (id, loginParams) => {
  // destructure  loginParams with variables in model
  const { email, password } = loginParams;

  // check if company exists
  const companyExists = await Logistics.findById(id);
  if (!companyExists) {
    return { err: "This company does not exist", status: 401 };
  }

  // if email is being changed, update company email
  if (email) {
    // check if new email belongs to another company
    const companyExistsWithEmail = await Logistics.findOne({ email });
    if (companyExistsWithEmail) {
      return { err: "This email has been registered already", status: 401 };
    }
    // update company email
    companyExists.email = email;
    await companyExists.save();
  }
  // if password is being changed, update company password
  if (password) {
    companyExists.password = await bcrypt.hash(password, 10);
    await companyExists.save();
  }

  return "Login Details Updated Successfully";
};

const updateCompanyImage = async (id, { image }) => {
  // check if company exists
  const companyExists = await Logistics.findById(id);
  if (!companyExists) {
    return { err: "This company does not exist", status: 401 };
  }

  // update company image
  companyExists.image = image;
  await companyExists.save();

  return "Image Updated Successfully";
};

const updateCompanyDetails = async (id, companyParams) => {
  // destructure  companyParams with variables in model
  const {
    companyName, companyAddress, location, placeId, email, password, account_details, pendingWithdrawal
  } = companyParams;

  // check if company exists
  const companyExists = await Logistics.findById(id);
  if (!companyExists) {
    return { err: "This company does not exist", status: 401 };
  }

  // update company details if they are being changed
  if (companyName) {
    // check if new company name belongs to another company
    const companyExistsWithName = await Logistics.findOne({ companyName });
    if (companyExistsWithName) {
      return { err: "This company name has been registered already", status: 401 };
    }
    companyExists.companyName = companyName;
  }
  if (companyAddress) {
    companyExists.companyAddress = companyAddress;
  }
  if (location) {
    companyExists.location = location;
    companyExists.location.type = "Point";
  }
  if (placeId) {
    companyExists.placeId = placeId;
  }
  if (email) {
    // check if email belongs to another company
    const companyExistsWithEmail = await Logistics.findOne({ email });
    if (companyExistsWithEmail) {
      return { err: "This email has been registered already", status: 401 };
    }
    companyExists.email = email;
  }
  if (password) {
    companyExists.password = await bcrypt.hash(password, 10);
  }
  if (account_details) {
    companyExists.account_details = account_details;
  }
  if (pendingWithdrawal === true || pendingWithdrawal === false) {
    companyExists.pendingWithdrawal = pendingWithdrawal;
  }

  await companyExists.save();

  return "Company Details Updated Successfully";
};

const viewCompanyRiders = async (id, urlParams) => {
  // setting pagination params
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);
  // check if company exists
  const companyExists = await Logistics.findById(id);
  if (!companyExists) {
    return { err: "This company does not exist", status: 401 };
  }

  // get all riders associated with company alongside total number of deliveries of each rider with mongodb aggregate
  const riders = await Rider.aggregate([
    {
      $match: {
        company: mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "deliveries",
        localField: "_id",
        foreignField: "rider",
        as: "deliveries",
      },
    },
    {
      $unwind: "$deliveries",
    },
    {
      $group: {
        _id: "$_id",
        riderFirstName: { $first: "$first_name" },
        riderLasrName: { $first: "$last_name" },
        // riderPhone: { $first: "$phone_number" },
        // riderImage: { $first: "$profilePhoto" },
        // riderLocation: { $first: "$location" },
        // riderPlaceId: { $first: "$place_id" },
        // riderEmail: { $first: "$email" },
        // riderIsBusy: { $first: "$isBusy" },
        riderDeliveries: { $sum: 1 },
        riderFee: { $sum: "$deliveries.deliveryFee" },
      },
    },
    // sort, skip and limit by number of deliveries
    {
      $sort: {
        riderFee: -1,
      },
    }
  ])
    .skip(skip)
    .limit(limit);

  return riders;
};

const viewCompanyRiderDetails = async (riderId) => {
  // check if rider exists
  const riderExists = await Rider.findById(riderId);
  if (!riderExists) {
    return { err: "This rider does not exist", status: 401 };
  }

  // get all riders associated with company alongside total number of deliveries of each rider with mongodb aggregate
  const riders = await Rider.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(riderId),
      },
    },
    {
      $lookup: {
        from: "deliveries",
        localField: "_id",
        foreignField: "rider",
        as: "deliveries",
      },
    },
    {
      $unwind: "$deliveries",
    },
    {
      $group: {
        _id: "$_id",
        riderFirstName: { $first: "$first_name" },
        riderLasrName: { $first: "$last_name" },
        riderPhone: { $first: "$phone_number" },
        riderImage: { $first: "$profilePhoto" },
        riderLocation: { $first: "$location" },
        riderEmail: { $first: "$email" },
        riderIsBusy: { $first: "$isBusy" },
        riderDeliveries: { $sum: 1 },
        riderFee: { $sum: "$deliveries.deliveryFee" },
      },
    },
  ]);

  return riders;
};

const requestWithdrawal = async (id) => {
  // check if company exists
  const companyExists = await Logistics.findById(id);
  if (!companyExists) {
    return { err: "This company does not exist", status: 401 };
  }

  // check if company has enough balance
  if (companyExists.account_details.account_balance < 1000) {
    return { err: "Insufficient Balance. You can only withdraw 1000 naira upwards.", status: 401 };
  }

  // check for pending store request
  let oldLogisticsRequest = await Transaction.find({
    type: "Debit",
    status: "pending",
    ref: companyExists._id
  });
  // add current account balance to pending logistics and ledger withdrawal request
  if (oldLogisticsRequest.length === 2 && companyExists.pendingWithdrawal === true) {
    await Transaction.updateMany(
      {
        type: "Debit",
        ref: companyExists._id,
        status: "pending"
      },
      { $inc: { amount: Number(companyExists.account_details.account_balance) } }
    );
    // oldLogisticsRequest.amount += Number(companyExists.account_details.account_balance);
    // await oldLogisticsRequest.save();
    // oldLedgerRequest.amount += Number(companyExists.account_details.account_balance);
    // await oldLedgerRequest.save();

    // update company account balance
    companyExists.account_details.total_debit += Number(companyExists.account_details.account_balance);
    companyExists.account_details.account_balance = Number(companyExists.account_details.total_credit - companyExists.account_details.total_debit);
    await companyExists.save();

    return "Withdrawal Request Updated Successfully";
  }

  // create debit transaction for company
  await createTransaction({
    amount: Number(companyExists.account_details.account_balance),
    type: "Debit",
    to: "logistics",
    receiver: companyExists._id,
    status: "pending",
    ref: companyExists._id,
    fee: 0
  });

  // create Debit transaction for ledger
  await createTransaction({
    amount: Number(companyExists.account_details.account_balance),
    type: "Debit",
    to: "Ledger",
    receiver: companyExists._id,
    status: "pending",
    ref: companyExists._id,
    fee: 0
  });

  // update company's withdraw status
  companyExists.pendingWithdrawal = true;
  await companyExists.save();

  return "Withdrawal Requested Successfully";
};

export {
  getAllCompanies,
  companySignup,
  companyLogin,
  companyDetails,
  updateCompanyAddress,
  updateLoginDetails,
  updateCompanyImage,
  updateCompanyDetails,
  viewCompanyRiders,
  viewCompanyRiderDetails,
  requestWithdrawal
};
