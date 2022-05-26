import Joi from "joi";

const waitlistValidation = {
  body: Joi.object({
    email: Joi.string().empty().email().required()
      .messages({
        "any.required": "Email is required.",
        "string.email": "Please enter a valid email",
        "string.empty": "Sorry, email cannot be an empty field",
      }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

export default waitlistValidation;
