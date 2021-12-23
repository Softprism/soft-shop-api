import { validationResult } from "express-validator";

import * as adminService from "../services/admin.service";

const getAdmins = async (req, res) => {
  const admins = await adminService.getAdmins();

  return res.status(200).json(admins);
};

const registerAdmin = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, msg: errors.array() });
  }

  const token = await adminService.registerAdmin(req.body);

  if (token.err) {
    res.status(409).json({ success: false, msg: token.err, status: token.status });
  } else {
    res.status(201).json({ success: true, result: token });
  }
};

const loginAdmin = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      msg: errors.array(),
    });
  }

  // Call Login function from adminService
  const token = await adminService.loginAdmin(req.body);

  if (token.err) {
    res.status(403).json({ success: false, msg: token.err, status: token.status });
  } else {
    res.status(200).json({ success: true, result: token });
  }
};

const getLoggedInAdmin = async (req, res, next) => {
  const admin = await adminService.getLoggedInAdmin(req.admin.id);

  if (admin.err) {
    res.status(404).json({ success: false, msg: token.err, status: token.status });
  } else {
    res.status(200).json({ success: true, result: admin });
  }
};

const updateAdmin = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const admin = await adminService.updateAdmin(req.body, req.admin.id);

  if (admin.msg) {
    res.status(500).json({ success: false, msg: admin.msg, status: admin.status });
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
