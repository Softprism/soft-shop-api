import Activities from "../models/activities.model";
import { createLog } from "./logs.service";

const createActivity = async (actor, actorId, title, description) => {
  try {
    await Activities.create({
      actor, actorId, title, description
    });
    return true;
  } catch (error) {
    await createLog("create_activity_error", "system", error);
  }
};

const getUserActivities = async (urlParams, actorId) => {
  // get all user's activity
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);
  let activities = await Activities.find({ actorId })
    .select("-actorId -description")
    .sort("createdDate")
    .skip(skip)
    .limit(limit);
  return activities;
};

const getActivities = async (urlParams) => {
  // get all users on an activity
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);
  const { sort } = urlParams;

  delete urlParams.limit;
  delete urlParams.skip;
  delete urlParams.page;
  delete urlParams.sort;

  if (urlParams.description) {
    urlParams.description = new RegExp(urlParams.description, "i");
  }

  let activities = await Activities.find(urlParams)
    .populate({ path: "actorId", select: "email" })
    // .select("-actorId")
    .sort(sort)
    .skip(skip)
    .limit(limit);
  return activities;
};

const getActivity = async (id) => {
  // get info of a particular activity
  let activity = await Activities.findById(id)
    .populate({ path: "actorId", select: "-password -email" });
  if (!activity) {
    return { err: "Can't find activity info", status: 400 };
  }
  return activity;
};

export {
  createActivity, getUserActivities, getActivity, getActivities
};
