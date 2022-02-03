/* eslint-disable no-unreachable */
/* eslint-disable import/prefer-default-export */
import twillow from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twillow(accountSid, authToken);

const sendSMS = async (toNumber, body) => {
  try {
    let action = await client.messages.create({
      body,
      from: "SoftShop",
      to: toNumber,
    });
    return action;
  } catch (error) {
    return { err: error.message };
    console.log(error.message);
  }
};

const sendUserSignupSMS = async (phone) => {
  let body = "Thanks for signing up!";
  let action = await sendSMS(phone, body);
  if (action.err) {
    console.log("could not send sms");
  }
};

const sendForgotPasswordSMS = async (phone, otp) => {
  let body = `Use ${otp} to verify your softshop account password reset request`;
  let action = await sendSMS(phone, body);
  if (action.err) {
    console.log("could not send sms");
  }
};

export { sendSMS, sendUserSignupSMS, sendForgotPasswordSMS };
