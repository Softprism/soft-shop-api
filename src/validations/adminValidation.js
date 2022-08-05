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
    image: Joi.string().min(5).required().messages({
      "string.empty": "Sorry, image cannot be an empty field",
      "string.min": "image should be 5 characters or more"
    }),
    first_name: Joi.string().min(5).required().messages({
      "string.empty": "Sorry, first_name cannot be an empty field",
      "string.min": "first_name should be 5 characters or more"
    }),
    last_name: Joi.string().min(5).required().messages({
      "string.empty": "Sorry, last_name cannot be an empty field",
      "string.min": "last_name should be 5 characters or more"
    }),
    phone_number: Joi.string().min(5).required().messages({
      "string.empty": "Sorry, phone_number cannot be an empty field",
      "string.min": "phone_number should be 5 characters or more"
    }),
    role: Joi.string().required().messages({
      "string.empty": "Sorry, role cannot be an empty field",
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
