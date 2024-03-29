import recommendVendor from "../services/vendor.service";

// ========================================================================== //
const recommend_vendor = async (req, res, next) => {
  try {
    const action = await recommendVendor(req.body);
    if (action.err) {
      return res
        .status(action.status)
        .json({
          success: false, msg: action.err, status: action.status
        });
    }
    res.status(201).json({ success: true, result: action.recommendedVendor, status: 201 });

    req.data = {
      email: action.recommendedVendor.email,
    };
    next();
  } catch (error) {
    next(error);
  }
};

export default recommend_vendor;
