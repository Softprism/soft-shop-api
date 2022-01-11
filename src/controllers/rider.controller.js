import {
  getAllRiders, verifyEmailAddress, registerRider, loginRider,
  validateToken, requestPasswordToken, resetPassword
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
    return res.status(200).json({ success: true, result: action, status: 200 });
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
    console.log(req.body);
    const result = await registerRider(req.body);

    if (result.err) {
      return res
        .status(result.status)
        .json({ success: false, msg: result.err, status: result.status });
    }

    return res
      .status(201)
      .json({
        success: true, token: result.token, status: 201
      });
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

    return res.status(200).json({
      success: true,
      token: loginRequest.token,
      status: 200
    });
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
export {
  createNewPassword, forgotPassword, getRiders,
  signin, signup, verifyToken, requestToken
};
