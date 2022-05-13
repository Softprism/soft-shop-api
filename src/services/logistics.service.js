// import logistics model es6 destructuring
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import Logistics from "../models/logistics-company.model";
import Rider from "../models/rider.model";
import getJwt from "../utils/jwtGenerator";

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
  return companyExists;
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

export {
  companySignup,
  companyLogin,
  companyDetails,
  updateCompanyAddress,
  updateLoginDetails,
  updateCompanyImage,
  updateCompanyDetails,
  viewCompanyRiders,
  viewCompanyRiderDetails
};
