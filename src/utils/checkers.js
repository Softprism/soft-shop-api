import User from "../models/user.model";

const isUserVerified = async (userId) => {
  const user = await User.findOne({ _id: userId, isVerified: true });
  if (!user) throw { err: "Please complete your signup verification", status: 403 };
};

const verifyEmailAddressChecker = async (req, res, next) => {
  if (!req.body.email) return res.status(400).json({ success: false, msg: "Please enter an email address.", status: 400 });
  next();
};

// eslint-disable-next-line import/prefer-default-export
export { isUserVerified, verifyEmailAddressChecker };
