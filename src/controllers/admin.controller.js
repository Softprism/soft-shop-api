import { validationResult } from "express-validator";

import * as adminService from "../services/admin.service";

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

export {
  getAdmins, registerAdmin, loginAdmin, getLoggedInAdmin, updateAdmin, resetStorePassword
};
