import DashboardServices from "../services/dashboard.service";

const {
  getRiderDashboard
} = DashboardServices;

/**
 * @class RiderController
 * @description create, verify and log in rider
 * @exports RiderController
 */
export default class DashboardController {
  // ========================================================================== //
  static async getRiderDashboard(req, res, next) {
    try {
      const action = await getRiderDashboard(req.query, req.rider._id);
      if (action.err) {
        return res
          .status(action.status)
          .json({
            success: false, msg: action.err, status: action.status
          });
      }
      const { orders, rider } = action;
      return res.status(200).json({ success: true, result: { rider, orders }, status: 200 });
    } catch (error) {
      next(error);
    }
  }
}
