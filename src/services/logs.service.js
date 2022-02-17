import logs from "../models/logs.model";

const createLog = async (action, actor, message) => {
  await logs.create({ action, actor, message });
};

// create log
const signupLog = async () => {
  await createLog("user signup", "user", "A new user -  with email -  just signed on softshop");
};

const getLogs = async (filter) => {
  let allLogs = await logs.find(filter);
  return allLogs;
};

export {
  createLog, getLogs, signupLog
};
