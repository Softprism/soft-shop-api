import Joi from "joi";

const recommendVendorValidation = {
  body: Joi.object({
    name: Joi.string().required().empty().messages({
      "any.required": "Name is required.",
      "string.empty": "Sorry, Name cannot be an empty field",
    }),
    email: Joi.string().empty().messages({
      "string.empty": "Sorry, Email or Phone cannot be an empty field",
    }),
    state: Joi.string().empty().required().messages({
      "any.required": "State is required.",
      "string.empty": "Sorry, State cannot be an empty field",
    }),
    city: Joi.string().empty().required().messages({
      "any.required": "city is required.",
      "string.empty": "Sorry, city cannot be an empty field",
    }),
    instagram: Joi.string().empty().messages({
      "string.empty": "Sorry, instagram cannot be an empty field",
    })
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

export default recommendVendorValidation;
