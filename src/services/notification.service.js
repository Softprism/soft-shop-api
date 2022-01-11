import Rider from "../models/rider.model";
import Order from "../models/order.model";
import Notification from "../models/notification.models";

/**
 * @class Notification
 * @description Notification services
 * @exports Notification
 */
export default class NotificationServices {
  /**
   * @returns {object} An instance of the Riders class
   */
  static async getAllRiderNotification(riderId, urlParams) {
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
  }

  /**
   * @returns {object} An instance of the Riders class
   */
  static async getRiderNotificationById(notificationId, riderId) {
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
  }

  /**
   * @returns {object} An instance of the Riders class
   */
  static async createNotification(userIds = [], orderId) {
    userIds.forEach(async (user) => {
      try {
        await Notification.create({
          title: "Order request",
          message: "You have a new delivery request",
          rider: user,
          extra_data: orderId,
          type: "Order"
        });
      } catch (error) {
        console.log(error);
      }
    });
    return true;
  }
}
