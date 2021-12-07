import express from "express";
import { validationResult } from "express-validator";

import * as userService from "../services/user.service.js";

const router = express.Router();

const getUsers = async (req, res) => {
  const users = await userService.getUsers(req.query);

  users && users.length > 0
    ? res.status(200).json({ success: true, result: users, size: users.length })
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

  return res
    .status(201)
    .json({ success: true, result: result.user, token: result.token });
};

const loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, msg: errors });
  }

  // Call Login function from userService
  const loginRequest = await userService.loginUser(req.body);
  console.log(await loginRequest);
  if (loginRequest.err) {
    return res.status(403).json({ success: false, msg: loginRequest.err });
  }

  res.status(200).json({
    success: true,
    result: loginRequest.userDetails[0],
    token: loginRequest.token,
  });
};

const getLoggedInUser = async (req, res, next) => {
  // Call Get Logged in User function from userService
  const user = await userService.getLoggedInUser(req.user.id);

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
// const createUserBasket = async (req, res) => { deprecated
//   if (!req.body.store) {
//     return res
//       .status(400)
//       .json({ success: false, msg: "basket details required" });
//   }
//   const action = await userService.createUserBasket(req.user.id, req.body);
//   if (action.err) {
//     return res.status(403).json({ success: false, msg: action.err });
//   }

//   res.status(200).json({ success: true, result: action });
// };

const addItemToBasket = async (req, res, next) => {
  try {
    const action = await userService.addItemToBasket(req.user.id, req.body);
    if (!action) {
      return res
        .status(400)
        .json({ success: false, msg: "error adding item to basket" });
    }

    res.status(200).json({ success: true, result: action });
  } catch (error) {
    next(error);
  }
};

const getUserBasketItems = async (req, res, next) => {
  try {
    const action = await userService.getUserBasketItems(req.user.id);
    if (!action) {
      return res
        .status(400)
        .json({ success: false, msg: "error adding item to basket" });
    }

    res.status(200).json({ success: true, result: action });
  } catch (error) {
    next(error);
  }
};

const editBasketItems = async (req, res, next) => {
  try {
    const action = await userService.editBasketItems(req.user.id, req.body);
    if (action.err) {
      return res.status(400).json({ success: false, msg: action.err });
    }

    res.status(200).json({ success: true, result: action });
  } catch (error) {
    next(error);
  }
};

const deleteBasketItem = async (req, res, next) => {
  try {
    const action = await userService.deleteBasketItem(req.user.id, req.body);
    if (action.err) {
      return res.status(400).json({ success: false, msg: action.err });
    }

    res.status(200).json({ success: true, result: action });
  } catch (error) {
    next(error);
  }
};

const deleteAllBasketItems = async (req, res, next) => {
  try {
    const action = await userService.deleteAllBasketItems(req.user.id);
    if (action.err) {
      return res.status(400).json({ success: false, msg: action.err });
    }

    res.status(200).json({ success: true, result: action });
  } catch (error) {
    next(error);
  }
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
  addItemToBasket,
  forgotPassword,
  validateToken,
  createNewPassword,
  // createUserBasket,
  getUserBasketItems,
  editBasketItems,
  deleteBasketItem,
  deleteAllBasketItems,
};
