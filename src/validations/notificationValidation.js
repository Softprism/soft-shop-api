import Joi from "joi";
import objectId from "./common";

const notificationValidation = {
  params: Joi.object({
    notificationId: objectId.required().messages({
      "any.required": "Notification id is required.",
      "string.length": "Notification id must be a valid mongoose id.",
    }),
  }).required(),
};
export default notificationValidation;
