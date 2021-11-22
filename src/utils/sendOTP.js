import Token from "../../models/tokens.model.js";

import otpGenerator from "otp-generator";

const getOTP = async (type, email) => {
  //Check if request has been made before, can be used for resend token
  let oldTokenRequest = await Token.findOne({ email, type });

  if (oldTokenRequest) {
    // resend old token
    return oldTokenRequest;
  }

  // generate OTP
  let otp = otpGenerator.generate(4, {
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });

  // add token to DB
  let tokenData = { email, otp, type };

  let newOTP = new Token(tokenData).save();

  return newOTP;
};

export { getOTP };
