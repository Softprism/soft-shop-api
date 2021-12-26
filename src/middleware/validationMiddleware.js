import validator from "validator";
import capitalize from "capitalize";
import bcrypt from "bcryptjs";
import User from "../models/user.model";

const verifyUserLoginParams = async (req, res, next) => {
  try {
    req.body.email = validator.trim(req.body.email);
    req.body.password = validator.trim(req.body.password);
    if (!validator.isEmail(req.body.email)) {
      return res.status(400).json({
        success: false,
        msg: "Email entered is invalid, please try again",
      });
    }

    if (validator.isEmpty(req.body.password)) {
      return res.status(400).json({
        success: false,
        msg: "Password field is missing!",
      });
    }
    next();
  } catch (error) {
    error.message = "Some fields are missing, please try again.";
    next(error);
  }
};

const verifyUserSignupParam = async (req, res, next) => {
  try {
    req.body.email = validator.trim(req.body.email);
    req.body.password = validator.trim(req.body.password);
    req.body.first_name = validator.trim(req.body.first_name);
    req.body.last_name = validator.trim(req.body.last_name);
    req.body.phone_number = validator.trim(req.body.phone_number);

    if (validator.isEmpty(req.body.email)) {
      return res.status(400).json({
        success: false,
        msg: "Please enter your email address.",
        status: 400
      });
    }

    if (!validator.isEmail(req.body.email)) {
      return res.status(400).json({
        success: false,
        msg: "Email entered is invalid, please try again.",
        status: 400
      });
    }

    if (validator.isEmpty(req.body.password)) {
      return res.status(400).json({
        success: false,
        msg: "Password field is missing.",
        status: 400
      });
    }

    if (validator.isEmpty(req.body.first_name)) {
      return res.status(400).json({
        success: false,
        msg: "Please enter your first name.",
        status: 400
      });
    }

    if (!validator.isAlpha(req.body.first_name)) {
      return res.status(400).json({
        success: false,
        msg: "Please enter a valid first name.",
        status: 400
      });
    }

    // capitalize first name field
    req.body.first_name = capitalize(req.body.first_name);

    if (validator.isEmpty(req.body.last_name)) {
      return res.status(400).json({
        success: false,
        msg: "Please enter your last name.",
        status: 400
      });
    }

    if (!validator.isAlpha(req.body.last_name)) {
      return res.status(400).json({
        success: false,
        msg: "Please enter a valid last name.",
        status: 400
      });
    }
    // capitalize last name field
    req.body.last_name = capitalize(req.body.last_name);

    if (validator.isEmpty(req.body.phone_number)) {
      return res.status(400).json({
        success: false,
        msg: "Please enter your phone number.",
        status: 400
      });
    }

    if (!validator.isInt(req.body.phone_number)) {
      return res.status(400).json({
        success: false,
        msg: "Please enter a valid phone number.",
        status: 400
      });
    }
  } catch (error) {
    error.message = "Some fields are missing, please try again.";
    next(error);
  }
  next();
};

const isUserVerified = async (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    const user = await User.findOne({ email: req.body.email, isVerified: true });
    if (!user) return res.status(400).json({ success: false, msg: "Please complete your signup verification.", status: 400 });
  }
  next();
};

const verifyEmailAddressChecker = async (req, res, next) => {
  if (!req.body.email) return res.status(400).json({ success: false, msg: "Please enter an email address.", status: 400 });
  next();
};

const hashPassword = async (req, res, next) => {
  // hashing password
  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);
  next();
};

const verifyStoreSignupParam = async (req, res, next) => {
  try {
    req.body.email = validator.trim(req.body.email);
    console.log(` "${req.body.password}"`);
    req.body.password = validator.trim(req.body.password);
    console.log(` "${req.body.password}"`);
    req.body.first_name = validator.trim(req.body.name);
    req.body.last_name = validator.trim(req.body.address);
    req.body.phone_number = validator.trim(req.body.phone_number);

    if (validator.isEmpty(req.body.email)) {
      return res.status(400).json({
        success: false,
        msg: "Please enter your email address.",
        status: 400
      });
    }

    if (!validator.isEmail(req.body.email)) {
      return res.status(400).json({
        success: false,
        msg: "Email entered is invalid, please try again.",
        status: 400
      });
    }

    if (validator.isEmpty(req.body.password)) {
      return res.status(400).json({
        success: false,
        msg: "Password field is missing.",
        status: 400
      });
    }
    if (validator.isEmpty(req.body.name)) {
      return res.status(400).json({
        success: false,
        msg: "Please enter your business name.",
        status: 400
      });
    }
    // capitalize last name field
    req.body.name = capitalize.words(req.body.name);

    if (validator.isEmpty(req.body.phone_number)) {
      return res.status(400).json({
        success: false,
        msg: "Please enter your phone number.",
        status: 400
      });
    }

    if (!validator.isInt(req.body.phone_number)) {
      return res.status(400).json({
        success: false,
        msg: "Please enter a valid phone number.",
        status: 400
      });
    }

    if (validator.isEmpty(req.body.address)) {
      return res.status(400).json({
        success: false,
        msg: "Please enter your business address.",
        status: 400
      });
    }

    if (!req.body.openingTime.includes(":") || !req.body.closingTime.includes(":")) {
      return res.status(400).json({
        success: false,
        msg: "Invalid time format.",
        status: 400
      });
    }
    next();
  } catch (error) {
    error.message = "Some fields are missing, please try again.";
    next(error);
  }
};

// eslint-disable-next-line import/prefer-default-export
export {
  isUserVerified, verifyEmailAddressChecker, verifyUserLoginParams, verifyUserSignupParam, hashPassword, verifyStoreSignupParam
};
