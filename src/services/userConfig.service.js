// used to update user fees fields

import Userconfig from "../models/configurations.model";

const createUserConfig = async ({ user, userId, fee }) => {
  let data = {
    user, userId, fee
  };
  await Userconfig.create(data);

  return "success";
};

const updateUserFee = async (userId, fee) => {
  let request = await Userconfig.findOneAndUpdate(
    { userId },
    { $set: { fee } },
    { omitUndefined: true, new: true, useFindAndModify: false }
  );
  return request;
};

export {
  createUserConfig,
  updateUserFee
};
