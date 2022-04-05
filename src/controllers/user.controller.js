import express from "express";
// import { validationResult } from "express-validator";
import * as userService from "../services/user.service";

const router = express.Router();

// ========================================================================== //

const verifyEmailAddress = async (req, res, next) => {
  try {
    const action = await userService.verifyEmailAddress(req.body);
    if (action.err) {
      return res
        .status(action.status)
        .json({
          success: false, msg: action.err, status: action.status
        });
    }
    res.status(200).json({ success: true, result: action.msg, status: 200 });
    req.data = {
      email: action.email,
    };
    next();
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //

const registerUser = async (req, res, next) => {
  try {
    const result = await userService.registerUser(req.body);

    if (result.err) {
      return res
        .status(result.status)
        .json({ success: false, msg: result.err, status: result.status });
    }

    res
      .status(201)
      .json({
        success: true, result: result.user, token: result.token, status: 201
      });

    req.data = {
      email: result.user[0].email,
      phone: result.user[0].phone_number,
      user_id: result.user[0]._id
    };
    next();
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //

const loginUser = async (req, res, next) => {
  try {
    // Call Login function from userService
    const loginRequest = await userService.loginUser(req.body);
    if (loginRequest.err) {
      return res.status(loginRequest.status).json({
        success: false,
        msg: loginRequest.err,
        status: loginRequest.status,
      });
    }

    res.status(200).json({
      success: true,
      result: loginRequest.userDetails[0],
      token: loginRequest.token,
      status: 200
    });

    req.data = {
      deviceToken: req.body.pushDeivceToken,
      id: loginRequest.userDetails[0]._id,
    };
    next();
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //

const getLoggedInUser = async (req, res, next) => {
  try {
    // Call Get Logged in User function from userService
    const user = await userService.getLoggedInUser(req.user.id);

    res.status(200).json({
      success: true,
      result: user[0],
      status: 200
    });
  } catch (error) {
    next(error);
  }
};

const addCard = async (req, res, next) => {
  try {
    const action = await userService.addCard(req.user.id);

    res.status(200).json({ success: true, result: action, status: 200 });
  } catch (error) {
    next(error);
  }
};
const removeCard = async (req, res, next) => {
  try {
    const action = await userService.removeCard(req.user.id, req.query.card_index);

    res.status(200).json({ success: true, result: action, status: 200 });
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //

const updateUser = async (req, res, next) => {
  try {
    let userID;

    if (req.user === undefined && req.query.userID === undefined) {
      res
        .status(400)
        .json({ success: false, msg: "unable to authenticate this user", status: 400 });
    }
    if (req.user) userID = req.user.id;
    if (req.query.userID && req.admin) userID = req.query.userID;

    const user = await userService.updateUser(req.body, userID);

    res.status(200).json({
      success: true,
      user,
      status: 200
    });

    req.localData = {
      user: user[0],
    };
    next();
  } catch (error) {
    next(error);
  }
};
// ========================================================================== //

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

// ========================================================================== //

const addItemToBasket = async (req, res, next) => {
  try {
    const action = await userService.addItemToBasket(req.user.id, req.body);

    res.status(200).json({ success: true, result: action, status: 200 });

    // create log
    await createLog("new basket item", "user", `A user with id ${req.user.id} just  added an item to their basket.`);
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //

const getUserBasketItems = async (req, res, next) => {
  try {
    const action = await userService.getUserBasketItems(req.user.id);
    res.status(200).json({
      success: true,
      result: action.userBasket,
      totalPrice: action.totalPrice,
      size: action.count,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //

const editBasketItems = async (req, res, next) => {
  try {
    const action = await userService.editBasketItems(req.user.id, req.body);
    if (action.err) {
      return res
        .status(action.status)
        .json({ success: false, msg: action.err, status: action.status });
    }

    res.status(200).json({
      success: true,
      result: action.userBasket,
      totalPrice: action.totalPrice,
      size: action.count,
      status: 200
    });
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //

const deleteBasketItem = async (req, res, next) => {
  try {
    const action = await userService.deleteBasketItem(req.user.id, req.body);
    if (action.err) {
      return res
        .status(action.status)
        .json({ success: false, msg: action.err, status: action.status });
    }

    res.status(200).json({ success: true, result: action, status: 200 });
    // create log
    await createLog("user remove basket item", "user", `A user  with id - ${req.user.id} just removed an item from their basket`);
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //

const deleteAllBasketItems = async (req, res, next) => {
  try {
    const action = await userService.deleteAllBasketItems(req.user.id);
    if (action.err) {
      return res
        .status(action.status)
        .json({ success: false, msg: action.err, status: action.status });
    }

    res.status(200).json({ success: true, result: action, status: 200 });
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //

const forgotPassword = async (req, res, next) => {
  try {
    const action = await userService.forgotPassword(req.body);

    if (action.err) {
      return res
        .status(action.status)
        .json({ success: false, msg: action.err, status: action.status });
    }

    res.status(200).json({ success: true, result: action, status: 200 });

    req.localData = {
      user: action.user,
    };
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //

const validateToken = async (req, res, next) => {
  try {
    const action = await userService.validateToken(req.body);

    if (action.err) {
      return res
        .status(action.status)
        .json({ success: false, msg: action.err, status: action.status });
    }

    return res.status(200).json({ success: true, result: action, status: 200 });
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //

const createNewPassword = async (req, res, next) => {
  try {
    const action = await userService.createNewPassword(req.body);
    if (action.err) {
      return res
        .status(action.status)
        .json({ success: false, msg: action.err, status: action.status });
    }

    res.status(200).json({ success: true, result: action, status: 200 });

    req.localData = {
      user: action[0],
      token: req.body.token,
    };
    next();
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //

export {
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
  addCard,
  removeCard
};
