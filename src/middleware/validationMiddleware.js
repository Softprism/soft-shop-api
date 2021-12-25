import validator from "validator";
import User from "../models/user.model";

const userLogin = async (req, res, next) => {
  if (!validator.isEmail(req.body.email)) {
    return res.status(400).json({
      success: false,
      msg: "email entered is invalid, please try again",
    });
  }

  if (validator.isEmpty(req.body.password)) {
    return res.status(400).json({
      success: false,
      msg: "Password field is missing!",
    });
  }
  next();
};

const isUserVerified = async (req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    const user = await User.findOne({ email: req.body.email, isVerified: true });
    if (!user) return res.status(400).json({ success: false, msg: "Please complete your signup verification.", status: 400 });
  }
  next();
};

const verifyEmailAddressChecker = async (req, res, next) => {
  if (!req.body.email) return res.status(400).json({ success: false, msg: "Please enter an email address.", status: 400 });
  next();
};

// eslint-disable-next-line import/prefer-default-export
export { isUserVerified, verifyEmailAddressChecker, userLogin };
