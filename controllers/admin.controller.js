import express from "express";
import { validationResult } from "express-validator";
import { auth } from "../middleware/auth.js";

import * as adminService from "../services/admin.service.js";

const router = express.Router();

const getAdmins = async (req, res) => {
  const admins = await adminService.getAdmins();

  admins && admins.length > 0
    ? res.status(200).json(admins)
    : res.status(404).json({ msg: "No Admin Users found" });
};

const registerAdmin = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, msg: errors.array() });
  }

  const token = await adminService.registerAdmin(req.body);

  if (token.err) {
    res.status(409).json({ success: false, msg: token.err });
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
    res.status(403).json({ success: false, msg: token.err });
  } else {
    res.status(200).json({ success: true, result: token });
  }
};

const getLoggedInAdmin = async (req, res, next) => {
  const admin = await adminService.getLoggedInAdmin(req.admin.id);

  if (admin.err) {
    res.status(500).json({ success: false, msg: token.err });
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
    res.status(500).json({ success: false, msg: admin.msg });
  } else {
    res.status(200).json({ success: true, result: admin });
  }
};

export { getAdmins, registerAdmin, loginAdmin, getLoggedInAdmin, updateAdmin };
