import {
  getAllRiders, verifyEmailAddress, registerRider, loginRider, loggedInRider,
  validateToken, requestPasswordToken, resetPassword, updateRider
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
      email: result.createdRider.email,
      phone: result.createdRider.phone_number
    };
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

export {
  createNewPassword, forgotPassword, getRiders, getLoggedInRider,
  signin, signup, verifyToken, requestToken, updateRiderProfile
};
