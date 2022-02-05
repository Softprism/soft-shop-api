import logs from "../models/logs.model";

const createLog = async (action, actor) => {
  console.log(action, actor);
  let request = await logs.create({ action, actor });
  console.log(request);
};

const getLogs = async (filter) => {
  let allLogs = await logs.find(filter);
  return allLogs;
};

export {
  createLog, getLogs
};
