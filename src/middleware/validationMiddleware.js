import validator from "validator";
import capitalize from "capitalize";
import bcrypt from "bcryptjs";
import User from "../models/user.model";

const isUserVerified = async (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    const user = await User.findOne({ email: req.body.email, isVerified: true });
    if (!user) return res.status(400).json({ success: false, msg: "Please complete your signup verification.", status: 400 });
  }
  next();
};

const hashPassword = async (req, res, next) => {
  try {
    // hashing password
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    next();
  } catch (error) {
    next();
  }
};

// eslint-disable-next-line import/prefer-default-export
export {
  isUserVerified, hashPassword
};
