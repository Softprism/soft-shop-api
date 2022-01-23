import Joi from "joi";
import objectId from "./common";

const registerValidation = {
  body: Joi.object({
    first_name: Joi.string().min(2).empty().required()
      .messages({
        "any.required": "First name is required.",
        "string.min": "Sorry First name cannot be less than 2 letters",
        "string.empty": "Sorry, First name cannot be an empty field",
      }),
    last_name: Joi.string().min(2).empty().required()
      .messages({
        "any.required": "Last name is required.",
        "string.min": "Sorry Last name cannot be less than 2 letters",
        "string.empty": "Sorry, Last name cannot be an empty field",
      }),
    email: Joi.string().email().empty().required()
      .messages({
        "any.required": "Email is required.",
        "string.email": "Please enter a valid email",
        "string.empty": "Sorry, email cannot be an empty field",
      }),
    phone_number: Joi.string().min(11).empty().required()
      .messages({
        "any.required": "Phone number is required.",
        "string.empty": "Sorry, phone number cannot be an empty field",
        "string.min": "Phone number should be 11 numbers"
      }),
    password: Joi.string().min(6).empty().required()
      .messages({
        "any.required": "Password is required.",
        "string.empty": "Sorry, password cannot be an empty field",
        "string.min": "Password should be six characters or more"
      }),
    token: objectId.required().empty().messages({
      "any.required": "Token is required.",
      "string.empty": "Sorry, token id cannot be an empty field",
      "string.length": "Token id must be a valid mongoose id.",
    }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const loginValidation = {
  body: Joi.object({
    email: Joi.string().empty().required().email()
      .messages({
        "any.required": "Email is required.",
        "string.email": "Please enter a valid email",
        "string.empty": "Sorry, email cannot be an empty field",
      }),
    password: Joi.string().empty().required().min(6)
      .max(54)
      .messages({
        "any.required": "Password is required.",
        "string.empty": "Sorry, password cannot be an empty field",
        "string.min": "Password should be six characters or more"
      }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const emailValidation = {
  body: Joi.object({
    email: Joi.string().empty().email().required()
      .messages({
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
    otp: Joi.string().empty().min(4).required()
      .messages({
        "string.empty": "Sorry, otp cannot be an empty field",
        "string.min": "Otp should be four characters"
      }),
    email: Joi.string().empty().email().required()
      .messages({
        "string.email": "Please enter a valid email",
        "string.empty": "Sorry, email cannot be an empty field",
      }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const resetValidation = {
  body: Joi.object({
    token: objectId.required().empty().messages({
      "string.empty": "Sorry, token id cannot be an empty field",
      "string.length": "Token id must be a valid mongoose id.",
    }),
    email: Joi.string().empty().email().required()
      .messages({
        "string.email": "Please enter a valid email",
        "string.empty": "Sorry, email cannot be an empty field",
      }),
    password: Joi.string().empty().min(6).required()
      .messages({
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
