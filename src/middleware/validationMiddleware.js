import validator from "validator";

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

export default userLogin;
