import Joi from "joi";

const register = {
  body: Joi.object({
    email: Joi.string().required().messages({
      "string.empty": "Sorry, email cannot be an empty field"
    }),
    password: Joi.string().min(5).required().messages({
      "string.empty": "Sorry, password cannot be an empty field",
      "string.min": "Password should be 5 characters or more"
    }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const login = {
  body: Joi.object({
    email: Joi.string().required().messages({
      "string.empty": "Sorry, email cannot be an empty field"
    }),
    password: Joi.string().min(5).required().messages({
      "string.empty": "Sorry, password cannot be an empty field",
      "string.min": "Password should be 5 characters or more"
    }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

export {
  register, login
};
