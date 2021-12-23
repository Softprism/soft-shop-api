import User from "../models/user.model";

const isUserVerified = async (userId) => {
  const user = await User.findOne({ _id: userId, isVerified: true });
  if (!user) throw { err: "Please complete your signup verification", status: 403 };
};

// eslint-disable-next-line import/prefer-default-export
export { isUserVerified };
