import Joi from "joi";

const register = {
  body: Joi.object({
    username: Joi.string().min(2).required().messages({
      "string.empty": "Sorry, username cannot be an empty field",
      "string.min": "Username should be 2 characters or more"
    }),
    password: Joi.string().min(5).required().messages({
      "string.empty": "Sorry, password cannot be an empty field",
      "string.min": "Password should be 5 characters or more"
    }),
  }).required(),
};

const login = {
  body: Joi.object({
    username: Joi.string().min(2).required().messages({
      "string.empty": "Sorry, username cannot be an empty field",
      "string.min": "Username should be 2 characters or more"
    }),
    password: Joi.string().min(5).required().messages({
      "string.empty": "Sorry, password cannot be an empty field",
      "string.min": "Password should be 5 characters or more"
    }),
  }).required(),
};

export {
  register, login
};
