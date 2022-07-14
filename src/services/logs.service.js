import logs from "../models/logs.model";
import { sendPlainEmail } from "../utils/sendMail";

const createLog = async (action, actor, message) => {
  await logs.create({ action, actor, message });
  console.log("created log");
  sendPlainEmail(
    "logs@soft-shop.app",
    "A new log has been created",
    `A new log has been created with action: ${action} and message: ${message}`
  );
};

const getLogs = async (filter) => {
  let allLogs = await logs.find(filter);
  return allLogs;
};

export {
  createLog, getLogs
};
