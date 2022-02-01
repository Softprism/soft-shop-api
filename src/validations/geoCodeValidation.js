import Joi from "joi";
import objectId from "./common";

const geoCodeValidation = {
  query: Joi.object({
    place_id: Joi.string().empty().messages({
      "string.empty": "Sorry, place_id cannot be an empty field",
    }),
    latlng: Joi.string().empty().messages({
      "string.empty": "Sorry, latlng cannot be an empty field",
    }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};
export default geoCodeValidation;
