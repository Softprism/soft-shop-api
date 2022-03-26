import {
  getAllRiderNotification, getRiderNotificationById, deleteRiderNotificationById, deleteRiderNotifications
} from "../services/notification.service";

// ========================================================================== //
const getNotifications = async (req, res, next) => {
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
};// ========================================================================== //
const getNotificationById = async (req, res, next) => {
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
};

// ========================================================================== //
const delete_Rider_Notification_ById = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const { _id } = req.rider;
    const action = await deleteRiderNotificationById(notificationId, _id);
    if (action.err) {
      return res
        .status(action.status)
        .json({
          success: false, msg: action.err, status: action.status
        });
    }
    return res.status(200).json({ success: true, result: action, status: 200 });
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //
const delete_Rider_Notifications = async (req, res, next) => {
  try {
    const { _id } = req.rider;
    const action = await deleteRiderNotifications(_id);
    if (action.err) {
      return res
        .status(action.status)
        .json({
          success: false, msg: action.err, status: action.status
        });
    }
    return res.status(200).json({ success: true, result: action, status: 200 });
  } catch (error) {
    next(error);
  }
};

export {
  getNotificationById, getNotifications, delete_Rider_Notification_ById, delete_Rider_Notifications
};
