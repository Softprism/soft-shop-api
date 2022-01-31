import Joi from "joi";
import objectId from "./common";

const registerStore = {
  body: Joi.object({
    name: Joi.string().min(2).empty().messages({
      "any.required": "Name is required.",
      "string.empty": "Sorry, name cannot be an empty field",
      "string.min": "Name should be two characters or more"
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
    images: Joi.array(),
    category: objectId.required().empty().messages({
      "any.required": "Category id is required.",
      "string.length": "Category id must be a valid mongoose id.",
    }),
    location: Joi.required().empty().messages({
      "any.required": "location is required."
    }),
    password: Joi.string().min(6).empty().required()
      .messages({
        "any.required": "Password is required.",
        "string.empty": "Sorry, password cannot be an empty field",
        "string.min": "Password should be six characters or more"
      }),
    openingTime: Joi.string().messages({
      "string.empty": "Sorry, Opening Time cannot be an empty field",
      "any.required": "Opening Time is required."
    }),
    closingTime: Joi.string().empty().messages({
      "any.required": "Closing Time is required.",
      "string.empty": "Sorry, Closing Time cannot be an empty field",
    }),
    address: Joi.string().empty().min(2).messages({
      "any.required": "Address is required.",
      "string.empty": "Sorry, address cannot be an empty field",
      "string.min": "Address should be 11 numbers"
    }),
    place_id: Joi.string().empty().messages({
      "string.empty": "Sorry, place_id cannot be an empty field"
    }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const loginStoreValidation = {
  body: Joi.object({
    email: Joi.string().email().empty().required()
      .messages({
        "any.required": "Email is required.",
        "string.email": "Please enter a valid email",
        "string.empty": "Sorry, email cannot be an empty field",
      }),
    password: Joi.string().min(6).empty().required()
      .messages({
        "any.required": "Password is required.",
        "string.empty": "Sorry, password cannot be an empty field",
        "string.min": "Password should be six characters or more"
      }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const updateStoreValidation = {
  body: Joi.object({
    address: Joi.string().min(2).messages({
      "string.empty": "Sorry, phone number cannot be an empty field",
      "string.min": "Address should be 11 numbers"
    }),
    email: Joi.string().email().messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Sorry, email cannot be an empty field",
    }),
    phone_number: Joi.string().min(11).messages({
      "string.empty": "Sorry, phone number cannot be an empty field",
      "string.min": "Phone number should be 11 numbers"
    }),
    images: Joi.array(),
    openingTime: Joi.string(),
    closingTime: Joi.string(),
    password: Joi.string().min(6).messages({
      "string.empty": "Sorry, password cannot be an empty field",
      "string.min": "Password should be six characters or more"
    }),
    deliveryTime: Joi.number().positive(),
    isActive: Joi.boolean(),
    pushNotifications: Joi.boolean(),
    promotionalNotifications: Joi.boolean(),
    smsNotifications: Joi.boolean(),
    prepTime: Joi.number().positive(),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const storeRequest = {
  body: Joi.object({
    address: Joi.string().min(2).messages({
      "string.empty": "Sorry, address cannot be an empty field",
      "string.min": "Address should be 11 numbers"
    }),
    place_id: Joi.string().min(2).messages({
      "string.empty": "Sorry, place_id cannot be an empty field",
      "string.min": "Address should be 11 numbers"
    }),
    name: Joi.string().min(2).messages({
      "string.empty": "Sorry, name cannot be an empty field",
      "string.min": "Name should be two characters or more"
    }),
    tax: Joi.string().min(2).messages({
      "string.empty": "Sorry, tax cannot be an empty field",
      "string.min": "Tax should be two characters or more"
    }),
    email: Joi.string().email().messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Sorry, email cannot be an empty field",
    }),
    phone_number: Joi.string().min(11).messages({
      "string.empty": "Sorry, phone number cannot be an empty field",
      "string.min": "Phone number should be 11 numbers"
    }),
    category: objectId.empty().messages({
      "any.required": "Category id is required.",
      "string.length": "Category id must be a valid mongoose id.",
    }),
    location: Joi.object({
      type: Joi.string().empty().messages({
        "string.empty": "Sorry, type cannot be an empty field",
      }),
      coordinates: Joi.array().empty().messages({
        "string.empty": "Sorry, coordinates cannot be an empty field",
      }),
    }),
    account_details: Joi.object({
      full_name: Joi.string().empty().messages({
        "string.empty": "Sorry, full name cannot be an empty field",
      }),
      bank_code: Joi.string().empty().messages({
        "string.empty": "Sorry, bank code cannot be an empty field",
      }),
      bank_name: Joi.string().empty().messages({
        "string.empty": "Sorry, bank name cannot be an empty field",
      }),
      account_number: Joi.string().empty().messages({
        "string.empty": "Sorry, account number cannot be an empty field",
      }),
    })

  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};
const labelValidation = {
  body: Joi.object({
    labelTitle: Joi.string().empty().required().messages({
      "any.required": "label title is required.",
      "string.empty": "Sorry, label title cannot be an empty field",
    }),
    labelThumb: Joi.string().empty().required().messages({
      "any.required": "label thumb is required.",
      "string.empty": "Sorry, label thumb cannot be an empty field",
    }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const editLabelValidation = {
  body: Joi.object({
    labelTitle: Joi.string().empty().messages({
      "string.empty": "Sorry, label title cannot be an empty field",
    }),
    labelThumb: Joi.string().empty().messages({
      "string.empty": "Sorry, label thumb cannot be an empty field",
    }),
    labelId: objectId.required().empty().messages({
      "any.required": "id is required.",
      "string.empty": "Sorry, label id cannot be an empty field",
      "string.length": "Label id must be a valid mongoose id.",
    }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const deleteLabelValidation = {
  body: Joi.object({
    labelId: objectId.required().empty().messages({
      "any.required": "id is required.",
      "string.empty": "Sorry, label id cannot be an empty field",
      "string.length": "Label id must be a valid mongoose id.",
    }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

export {
  registerStore, updateStoreValidation, loginStoreValidation,
  storeRequest, labelValidation, deleteLabelValidation, editLabelValidation
};
