import NotificationServices from "../services/notification.service";

const {
  getAllRiderNotification, getRiderNotificationById
} = NotificationServices;

/**
 * @class NotificationController
 * @description fetch rider Notifications
 * @exports NotificationController
 */
export default class NotificationController {
  // ========================================================================== //

  static async getNotifications(req, res, next) {
    try {
      const action = await getAllRiderNotification(req.rider._id, req.query);
      if (action.err) {
        return res
          .status(action.status)
          .json({
            success: false, msg: action.err, status: action.status
          });
      }
      return res.status(200).json({ success: true, result: action.notifications, status: 200 });
    } catch (error) {
      next(error);
    }
  }// ========================================================================== //

  static async getNotificationById(req, res, next) {
    try {
      const { notificationId } = req.params;
      const { _id } = req.rider;
      const action = await getRiderNotificationById(notificationId, _id);
      if (action.err) {
        return res
          .status(action.status)
          .json({
            success: false, msg: action.err, status: action.status
          });
      }
      return res.status(200).json({ success: true, result: action.notification, status: 200 });
    } catch (error) {
      next(error);
    }
  }
}
