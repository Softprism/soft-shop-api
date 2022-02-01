import riderDashboard from "../services/dashboard.service";

// ========================================================================== //
const getRiderDashboard = async (req, res, next) => {
  try {
    const action = await riderDashboard(req.query, req.rider._id);
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
};
export default getRiderDashboard;
