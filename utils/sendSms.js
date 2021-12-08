import twillow from "twilio";
import dotenv from "dotenv";

dotenv.config();
console.log(process.env);
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twillow(accountSid, authToken);

const sendSMS = async (toNumber, body) => {
  let action = await client.messages.create({
    body,
    from: "+16413473423",
    to: toNumber,
  });
  console.log(action);
};

export { sendSMS };
