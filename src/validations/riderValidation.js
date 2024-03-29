import Joi from "joi";
import { ObjectId } from "mongodb";
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
    company_id: objectId.empty().messages({
      "string.empty": "Sorry, company id cannot be an empty field",
      "string.length": "Company id must be a valid mongoose id.",
    }),
    corporate: Joi.boolean().empty().messages({
      "boolean.empty": "Sorry, corporate cannot be an empty field",
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
    pushDeviceToken: Joi.string(),
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
    type: Joi.string().valid("rider-signup", "rider-forgot-password").required(),
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

const updateRiderValidation = {
  body: Joi.object({
    password: Joi.string().min(6).empty()
      .messages({
        "string.empty": "Sorry, password cannot be an empty field",
        "string.min": "Password should be six characters or more"
      }),
    original_password: Joi.string().min(6).empty()
      .messages({
        "string.empty": "Sorry, original password cannot be an empty field",
        "string.min": "Original password should be six characters or more"
      }),
    email: Joi.string().email().empty()
      .messages({
        "string.email": "Please enter a valid email",
        "string.empty": "Sorry, email cannot be an empty field",
      }),
    first_name: Joi.string().empty().messages({
      "string.empty": "Sorry, First name cannot be an empty field",
    }),
    location: Joi.object().empty().messages({
      "object.unknown": "You have used an invalid key."
    }),
    place_id: Joi.string().empty().messages({
      "string.empty": "Sorry, field cannot be an empty field",
    }),
    last_name: Joi.string().empty().messages({
      "string.empty": "Sorry, Last name cannot be an empty field",
    }),
    phone_number: Joi.string().min(11).empty()
      .messages({
        "string.empty": "Sorry, phone number cannot be an empty field",
        "string.min": "Phone number should be 11 numbers"
      }),
    profilePhoto: Joi.string().empty()
      .messages({
        "string.empty": "Sorry, profile photo cannot be an empty field",
        "string.min": "Profile photo should be 11 numbers"
      }),
    account_details: Joi.object({
      account_number: Joi.string().empty().min(10)
        .messages({
          "string.empty": "Sorry, account number cannot be an empty field",
          "string.min": "Account number should be 10 numbers",
        }),
      bank_name: Joi.string().empty().min(3)
        .messages({
          "string.empty": "Sorry, bank name cannot be an empty field",
          "string.min": "Bank name should be 3 characters or more",
        }),
      full_name: Joi.string().empty().min(3)
        .messages({
          "string.empty": "Sorry, full name cannot be an empty field",
          "string.min": "Full name should be 3 characters or more",
        }),
      bank_code: Joi.string().empty().min(3)
        .messages({
          "string.empty": "Sorry, bank code cannot be an empty field",
          "string.min": "Bank code should be 3 characters or more",
        }),
    }),
    company_id: objectId.empty().messages({
      "string.empty": "Sorry, company id cannot be an empty field",
      "string.length": "Company id must be a valid mongoose id.",
    }),
    corporate: Joi.boolean().empty().messages({
      "boolean.empty": "Sorry, corporate cannot be an empty field",
    }),
    pushNotifications: Joi.boolean().empty(),
    isBusy: Joi.boolean().empty(),
    smsNotifications: Joi.boolean().empty(),
    pushDeviceToken: Joi.string(),
    promotionalNotifications: Joi.boolean().empty()
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

export {
  registerValidation, emailValidation, tokenValidation,
  resetValidation, loginValidation, updateRiderValidation
};
