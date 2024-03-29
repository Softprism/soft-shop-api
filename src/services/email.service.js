import Rider from "../models/rider.model";
import Store from "../models/store.model";
import User from "../models/user.model";
import { sendPlainEmail } from "../utils/sendMail";

const sendRiderEmail = async (riderId, urlParams) => {
  const { subject, body } = urlParams;
  const rider = await Rider.findById({ _id: riderId });
  if (!rider) {
    return { err: "Rider does not exists.", status: 404, };
  }
  await sendPlainEmail(rider.email, subject, body);
  return "message sent successfully";
};

const sendUserEmail = async (userId, urlParams) => {
  const { subject, body } = urlParams;
  const user = await User.findById({ _id: userId });
  if (!user) {
    return { err: "User does not exists.", status: 404, };
  }
  await sendPlainEmail(user.email, subject, body);
  return "message sent successfully";
};

const sendStoreEmail = async (storeId, urlParams) => {
  const { subject, body } = urlParams;
  const store = await Store.findById({ _id: storeId });
  if (!store) {
    return { err: "Store does not exists.", status: 404, };
  }
  await sendPlainEmail(store.email, subject, body);
  return "message sent successfully";
};

const sendAllRidersEmails = async (urlParams) => {
  const { subject, body } = urlParams;

  const riders = await Rider.find();
  riders.map(async (rider) => {
    await sendPlainEmail(rider.email, subject, body);
  });

  return "Sending messages to riders";
};

const sendAllStoresEmails = async (urlParams) => {
  const { subject, body } = urlParams;

  const stores = await Store.find();
  await Promise.all(stores.map(async (store) => {
    sendPlainEmail(store.email, subject, body);
  }));

  return "Sending messages to stores";
};

const sendAllUsersEmails = async (urlParams) => {
  const { subject, body } = urlParams;

  const users = await User.find();
  await Promise.all(users.map(async (user) => {
    sendPlainEmail(user.email, subject, body);
  }));

  return "Sending messages to users";
};

const sendAllEmails = async (urlParams) => {
  const { subject, body } = urlParams;

  const users = await User.find();
  const stores = await Store.find();
  const riders = await Rider.find();

  const array = [...users, ...stores, ...riders];
  await Promise.all(array.map(async (user) => {
    sendPlainEmail(user.email, subject, body);
  }));

  return "Sending messages to all users";
};

export {
  sendRiderEmail, sendUserEmail, sendStoreEmail, sendAllStoresEmails,
  sendAllRidersEmails, sendAllUsersEmails, sendAllEmails
};
