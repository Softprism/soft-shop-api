import express from "express";
import { validationResult } from "express-validator";
import { auth } from "../middleware/auth.js";

import * as userService from "../services/user.service.js";

const router = express.Router();

const getUsers = async (req, res) => {
  if (req.query.skip === undefined || req.query.limit === undefined) {
    return res
      .status(400)
      .json({ success: false, msg: "filtering parameters are missing" });
  }

  const users = await userService.getUsers(req.query);

  users && users.length > 0
    ? res.status(200).json(users)
    : res.status(404).json({ success: false, msg: "No Users found" });
};

const verifyEmailAddress = async (req, res) => {
  const action = await userService.verifyEmailAddress(req.body);

  if (action.err) {
    return res.status(403).json({ success: false, msg: action.err });
  }

  return res.status(202).json({ success: true, result: action });
};

const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, msg: errors.array() });
  }

  const result = await userService.registerUser(req.body);

  if (result.err) {
    return res.status(409).json({ success: false, msg: result.err });
  }

  return res.status(201).json({ success: true, result: result });
};

const loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, msg: errors });
  }

  // Call Login function from userService
  const token = await userService.loginUser(req.body);
  console.log(token);
  if (token.err) {
    return res.status(403).json({ success: false, msg: token.err });
  }

  res.status(200).json({
    success: true,
    result: token[0],
  });
};

const getLoggedInUser = async (req, res, next) => {
  // Call Get Logged in User function from userService
  const user = await userService.getLoggedInUser(req.user.id);

  console.log(user);

  if (user.err) {
    res.status(400).json({ success: false, msg: user.err });
  }

  res.status(200).json({
    success: true,
    result: user[0],
  });
};

const updateUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let userID;

  if (req.user === undefined && req.query.userID === undefined) {
    res
      .status(400)
      .json({ success: false, msg: "unable to authenticate this user" });
  }
  if (req.user) userID = req.user.id;
  if (req.query.userID && req.admin) userID = req.query.userID;

  const user = await userService.updateUser(req.body, userID);

  if (user.err) {
    return res.status(500).json({ success: false, msg: user.err });
  }

  res.status(200).json({
    success: true,
    user: user,
  });
};

const addItemToCart = async (req, res) => {
  const action = await userService.addItemToCart(req.user.id, req.body);

  if (action.err) {
    return es.status(404).json({ success: false, msg: action.err });
  }

  res.status(200).json({ success: true, result: action });
};

const forgotPassword = async (req, res) => {
  const action = await userService.forgotPassword(req.body);

  if (action.err) {
    return res.status(404).json({ success: false, msg: action.err });
  }

  return res.status(200).json({ success: true, result: action });
};

const validateToken = async (req, res) => {
  const action = await userService.validateToken(req.query);

  if (action.err) {
    return res.status(403).json({ success: false, msg: action.err });
  }

  return res.status(200).json({ success: true, result: action });
};

const createNewPassword = async (req, res) => {
  const action = await userService.createNewPassword(req.body);
  if (action.err) {
    return res.status(403).json({ success: false, msg: action.err });
  }

  return res.status(200).json({ success: true, result: action });
};
export {
  getUsers,
  verifyEmailAddress,
  registerUser,
  loginUser,
  getLoggedInUser,
  updateUser,
  addItemToCart,
  forgotPassword,
  validateToken,
  createNewPassword,
};
