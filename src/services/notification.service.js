import Rider from "../models/rider.model";
import Order from "../models/order.model";
import Notification from "../models/notification.models";

const getAllRiderNotification = async (riderId, urlParams) => {
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);

  delete urlParams.limit;
  delete urlParams.skip;
  delete urlParams.page;

  const notifications = await Notification.find({ rider: riderId })
    .sort({ createdDate: -1 }) // -1 for descending sort
    .skip(skip)
    .limit(limit);

  return { notifications };
};

const getRiderNotificationById = async (notificationId, riderId) => {
  await Notification.findOneAndUpdate(
    { _id: notificationId, rider: riderId },
    { status: "read" },
    { new: true }
  );
  const notification = await Notification.findOne({ _id: notificationId, rider: riderId })
    .populate([{ path: "extra_data", populate: "store" }]);
  if (!notification) {
    return {
      err: "Notification does not exists.",
      status: 404,
    };
  }
  return { notification };
};

const createNotification = async (userIds = [], orderId) => {
  let array = [];
  array = userIds.map((user) => {
    return {
      title: "Order request",
      message: "You have a new delivery request",
      rider: user,
      extra_data: orderId,
      type: "Order"
    };
  });
  await Notification.insertMany(array);
  return true;
};
export { createNotification, getRiderNotificationById, getAllRiderNotification };
