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
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
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
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

export {
  register, login
};
