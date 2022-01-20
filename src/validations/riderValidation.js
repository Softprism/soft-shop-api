import Joi from "joi";
import objectId from "./common";

const registerValidation = {
  body: Joi.object({
    first_name: Joi.string().min(2).required().messages({
      "string.min": "Sorry First name cannot be less than 2 letters",
      "string.empty": "Sorry, First name cannot be an empty field",
    }),
    last_name: Joi.string().min(2).required().messages({
      "string.min": "Sorry Last name cannot be less than 2 letters",
      "string.empty": "Sorry, Last name cannot be an empty field",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Sorry, email cannot be an empty field",
    }),
    phone_number: Joi.string().min(11).required().messages({
      "string.empty": "Sorry, phone number cannot be an empty field",
      "string.min": "Phone number should be 11 numbers"
    }),
    password: Joi.string().min(6).required().messages({
      "string.empty": "Sorry, password cannot be an empty field",
      "string.min": "Password should be six characters or more"
    }),
    token: objectId.required(),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const loginValidation = {
  body: Joi.object({
    email: Joi.string().required().email()
      .messages({
        "string.email": "Please enter a valid email",
        "string.empty": "Sorry, email cannot be an empty field",
      }),
    password: Joi.string().required().min(6).max(54)
      .messages({
        "string.empty": "Sorry, password cannot be an empty field",
        "string.min": "Password should be six characters or more"
      }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const emailValidation = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Sorry, email cannot be an empty field",
    }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const tokenValidation = {
  body: Joi.object({
    type: Joi.string().valid("rider-signup").required(),
    otp: Joi.string().min(4).required().messages({
      "string.empty": "Sorry, otp cannot be an empty field",
      "string.min": "Otp should be four characters"
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Sorry, email cannot be an empty field",
    }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const resetValidation = {
  body: Joi.object({
    token: objectId.required(),
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Sorry, email cannot be an empty field",
    }),
    password: Joi.string().min(6).required().messages({
      "string.empty": "Sorry, password cannot be an empty field",
      "string.min": "Password should be six characters or more"
    }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

export {
  registerValidation, emailValidation, tokenValidation,
  resetValidation, loginValidation
};
