import Joi from "joi";
import objectId from "./common";

const notificationValidation = {
  params: Joi.object({
    notificationId: objectId.required(),
  }).required(),
};
export default notificationValidation;
