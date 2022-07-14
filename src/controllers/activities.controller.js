import { getActivities, getActivity, getUserActivities } from "../services/activities.service";

const getUserActivitiesCtrl = async (req, res, next) => {
  try {
    let activities = await getUserActivities(req.query, req.params.actorId);
    res.status(200).json({
      success: true, result: activities, size: activities.length, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const getActivitiesCtrl = async (req, res, next) => {
  try {
    let activities = await getActivities(req.query);
    res.status(200).json({
      success: true, result: activities, size: activities.length, status: 200
    });
  } catch (error) {
    next(error);
  }
};

const getActivityCtrl = async (req, res, next) => {
  try {
    let activity = await getActivity(req.params.activityId);
    if (activity.err) {
      return res.status(activity.status).json({ success: false, msg: activity.err, status: activity.status });
    }
    res.status(200).json({
      success: true, result: activity, size: activity.length, status: 200
    });
  } catch (error) {
    next(error);
  }
};

export { getUserActivitiesCtrl, getActivitiesCtrl, getActivityCtrl };
