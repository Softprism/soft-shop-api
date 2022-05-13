import * as logisticsService from "../services/logistics.service";
import { sendSignUpOTPmail } from "../utils/sendMail";
import getOTP from "../utils/sendOTP";

const companySignup = async (req, res) => {
  const action = await logisticsService.companySignup(req.body);
  // check for errors
  if (action.err) {
    return res.status(action.status).json({ success: false, result: action.err });
  }
  // send response
  res.status(201).json({
    success: true, result: action.saveAction, token: action.token, status: 201
  });
};

const companyLogin = async (req, res) => {
  const action = await logisticsService.companyLogin(req.body);
  // check for errors
  if (action.err) {
    return res.status(action.status).json({ success: false, result: action.err });
  }
  // send response
  res.status(200).json({
    success: true, result: action.token, status: 200
  });
};

const companyDetails = async (req, res) => {
  const data = await logisticsService.companyDetails(req.logistics.id);
  // check for errors
  if (data.err) {
    return res.status(data.status).json({ success: false, result: data.err });
  }
  // send response
  res.status(200).json({
    success: true, result: data, status: 200
  });
};

const updateCompanyAddress = async (req, res) => {
  const action = await logisticsService.updateCompanyAddress(req.logistics.id, req.body);
  // check for errors
  if (action.err) {
    return res.status(action.status).json({ success: false, result: action.err });
  }
  // send response
  res.status(200).json({
    success: true, result: action, status: 200
  });
};

const updateLoginDetails = async (req, res) => {
  const action = await logisticsService.updateLoginDetails(req.logistics.id, req.body);
  // check for errors
  if (action.err) {
    return res.status(action.status).json({ success: false, result: action.err });
  }
  // send response
  res.status(200).json({
    success: true, result: action, status: 200
  });
};

const updateCompanyImage = async (req, res) => {
  if (req.admin) {
    riderId = req.query.riderId;
  } else {
    riderId = req.logistics.id;
  }
  const action = await logisticsService.updateCompanyImage(riderId, req.body);
  // check for errors
  if (action.err) {
    return res.status(action.status).json({ success: false, result: action.err });
  }
  // send response
  res.status(200).json({
    success: true, result: action, status: 200
  });
};
const updateCompanyDetails = async (req, res) => {
  const action = await logisticsService.updateCompanyDetails(req.logistics.id, req.body);
  // check for errors
  if (action.err) {
    return res.status(action.status).json({ success: false, result: action.err });
  }
  // send response
  res.status(200).json({
    success: true, result: action, status: 200
  });
};

const viewCompanyRiders = async (req, res) => {
  const data = await logisticsService.viewCompanyRiders(req.logistics.id, req.query);
  // check for errors
  if (data.err) {
    return res.status(data.status).json({ success: false, result: data.err });
  }
  // send response
  res.status(200).json({
    success: true, result: data, status: 200
  });
};

const viewCompanyRiderDetails = async (req, res) => {
  const data = await logisticsService.viewCompanyRiderDetails(req.params.riderId);
  // check for errors
  if (data.err) {
    return res.status(data.status).json({ success: false, result: data.err });
  }
  // send response
  res.status(200).json({
    success: true, result: data, status: 200
  });
};

const requestWithdrawal = async (req, res) => {
  const action = await logisticsService.requestWithdrawal(req.logistics.id);
  // check for errors
  if (action.err) {
    return res.status(action.status).json({ success: false, result: action.err });
  }
  // send response
  res.status(200).json({
    success: true, result: action, status: 200
  });
};
export {
  companySignup, companyLogin, companyDetails, updateCompanyAddress, updateLoginDetails, updateCompanyImage, updateCompanyDetails, viewCompanyRiders, viewCompanyRiderDetails, requestWithdrawal
};
