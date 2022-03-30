import logs from "../models/logs.model";

const createLog = async (action, actor, message) => {
  await logs.create({ action, actor, message });
};

const getLogs = async (filter) => {
  let allLogs = await logs.find(filter);
  return allLogs;
};

export {
  createLog, getLogs
};
