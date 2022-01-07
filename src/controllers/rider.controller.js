import RiderServices from "../services/rider.service";

const {
  getAllRiders, verifyEmailAddress, registerRider, loginRider,
  validateToken, requestPasswordToken, resetPassword
} = RiderServices;

/**
 * @class RiderController
 * @description create, verify and log in rider
 * @exports RiderController
 */
export default class RiderController {
  // ========================================================================== //

  static async requestToken(req, res, next) {
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
  }

  // ========================================================================== //

  static async verifyToken(req, res, next) {
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
  }

  // ========================================================================== //

  static async signup(req, res, next) {
    try {
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
  }

  // ========================================================================== //

  static async signin(req, res, next) {
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
  }

  // ========================================================================== //

  static async getRiders(req, res, next) {
    try {
      const riders = await getAllRiders(req.query);

      return res.status(200).json({
        success: true, result: riders, size: riders.length, status: 200
      });
    } catch (error) {
      next(error);
    }
  }

  // ========================================================================== //

  static async forgotPassword(req, res, next) {
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
  }

  // ========================================================================== //

  static async createNewPassword(req, res, next) {
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
  }
}
