import Rider from "../models/rider.model";
import { createActivity } from "../services/activities.service";
import {
  getAllRiders, verifyEmailAddress, registerRider, loginRider, loggedInRider,
  validateToken, requestPasswordToken, resetPassword, updateRider, requestPayout, getPayoutHistory, updateRiderAccountDetails, deleteAccount
} from "../services/rider.service";

// ========================================================================== //
const requestToken = async (req, res, next) => {
  try {
    const action = await verifyEmailAddress(req.body);
    if (action.err) {
      return res
        .status(action.status)
        .json({
          success: false, msg: action.err, status: action.status
        });
    }
    res.status(200).json({ success: true, result: action, status: 200 });
    req.data = {
      email: action.email,
      otp: action.otp
    };
    next();
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //
const verifyToken = async (req, res, next) => {
  try {
    const action = await validateToken(req.body);

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
const signup = async (req, res, next) => {
  try {
    if (req.body.corporate === false) req.body.company_id = null;
    const result = await registerRider(req.body);

    if (result.err) {
      return res
        .status(result.status)
        .json({ success: false, msg: result.err, status: result.status });
    }

    res
      .status(201)
      .json({
        success: true, result: result.createdRider, token: result.riderToken, status: 201
      });

    req.data = {
      riderId: result.createdRider._id
    };

    // create user config on signup
    await createUserConfig({
      user: "Rider",
      userId: result.createdRider._id,
      fee: 10
    });
    // log activity
    let rider = await Rider.findOne({ email: req.body.email });
    await createActivity(
      "Rider",
      rider._id,
      "Signed up",
      `Rider with email ${rider.email} created successfully`
    );
    next();
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //
const signin = async (req, res, next) => {
  try {
    // Call Login function from userService
    const loginRequest = await loginRider(req.body);
    if (loginRequest.err) {
      return res.status(loginRequest.status).json({
        success: false,
        msg: loginRequest.err,
        status: loginRequest.status,
      });
    }

    res.status(200).json({
      success: true,
      token: loginRequest.token,
      status: 200
    });

    req.data = {
      id: loginRequest.rider._id
    };

    // log activity
    let rider = await Rider.findOne({ email: req.body.email });
    await createActivity(
      "Rider",
      rider._id,
      "Logged in",
      `Rider with email ${rider.email} logged in successfully`
    );
    next();
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //
const getRiders = async (req, res, next) => {
  try {
    const riders = await getAllRiders(req.query);

    return res.status(200).json({
      success: true, result: riders, size: riders.length, status: 200
    });
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //
const forgotPassword = async (req, res, next) => {
  try {
    const action = await requestPasswordToken(req.body);

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
    const action = await resetPassword(req.body);
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
const updateRiderProfile = async (req, res, next) => {
  try {
    const { id } = req.rider;
    const action = await updateRider(req.body, id);
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

const getLoggedInRider = async (req, res, next) => {
  try {
    // Call Get Logged in Rider function from riderService
    const rider = await loggedInRider(req.rider.id);
    if (rider.err) {
      return res
        .status(rider.status)
        .json({ success: false, msg: rider.err, status: rider.status });
    }
    return res.status(200).json({
      success: true,
      result: rider,
      status: 200
    });
  } catch (error) {
    next(error);
  }
};

const requestPayoutCtrl = async (req, res, next) => {
  try {
    const payout = await requestPayout(req.rider.id);

    if (payout.err) {
      return res.status(payout.status).json(
        { success: false, msg: payout.err, status: payout.status }
      );
    }

    return res.status(200).json({
      success: true,
      result: payout,
      status: 200
    });
  } catch (error) {
    next(error);
  }
};

const getPayoutHistoryCtrl = async (req, res, next) => {
  try {
    const payouts = await getPayoutHistory(req.rider.id, req.query);

    return res.status(200).json({
      success: true,
      result: payouts,
      size: payouts.length,
      status: 200
    });
  } catch (error) {
    next(error);
  }
};

const updateRiderAccountDetailsCtrl = async (req, res, next) => {
  try {
    const action = await updateRiderAccountDetails(req.rider.id, req.body);

    return res.status(200).json({
      success: true,
      result: action,
      status: 200
    });
  } catch (error) {
    next(error);
  }
};

const deleteAccountCtrl = async (req, res, next) => {
  try {
    const action = await deleteAccount(req.rider.id);

    return res.status(200).json({
      success: true,
      result: action,
      status: 200
    });
  } catch (error) {
    next(error);
  }
};

export {
  createNewPassword, forgotPassword, getRiders, getLoggedInRider,
  signin, signup, verifyToken, requestToken, updateRiderProfile, requestPayoutCtrl, getPayoutHistoryCtrl, updateRiderAccountDetailsCtrl, deleteAccountCtrl
};
