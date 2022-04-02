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
      statusCallback: "https://soft-shop.app/api/v1/test/sms-feedback"
    });
    return action;
  } catch (error) {
    return { err: error.message };
  }
};

const sendUserSignupSMS = async (phone) => {
  let body = "Thanks for signing up!";
  let action = await sendSMS(phone, body);
  if (action.err) {
    console.log(`could not send sms to ${phone}`);
  }
};

const sendForgotPasswordSMS = async (phone, otp) => {
  let body = `Use ${otp} to verify your softshop account password reset request`;
  let action = await sendSMS(phone, body);
  if (action.err) {
    console.log("could not send sms");
  }
};

const sendUserOrderPickedUpSMS = async (orderId, phone, dropoff) => {
  let body = `Your order ${orderId} has been picked up for delivery, please be available at ${dropoff}`;
  let action = await sendSMS(phone, body);
  if (action.err) {
    console.log("could not send sms");
  }
};

const sendUserOrderDeliveredSMS = async (orderId, phone, dropoff) => {
  let body = `Your order ${orderId} has arrived at ${dropoff}`;
  let action = await sendSMS(phone, body);
  if (action.err) {
    console.log("could not send sms");
  }
};
const sendUserNewOrderAcceptedSMS = async (orderId, phone, store) => {
  let body = `Your order ${orderId} has been accepted and is being prepared by ${store} we'll also notify you when your order is on the way.`;
  let action = await sendSMS(phone, body);
  if (action.err) {
    console.log("could not send sms");
  }
};
const sendUserNewOrderRejectedSMS = async (orderId, phone, store) => {
  let body = `Your ${orderId} order has been rejected by ${store} you can checkout alternative store near you for the same items.`;
  let action = await sendSMS(phone, body);
  if (action.err) {
    console.log("could not send sms");
  }
};

export {
  sendSMS, sendUserSignupSMS, sendForgotPasswordSMS, sendUserOrderPickedUpSMS, sendUserOrderDeliveredSMS, sendUserNewOrderAcceptedSMS, sendUserNewOrderRejectedSMS
};
