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
      "any.required": "Token id is required.",
      "string.length": "Token id must be a valid mongoose id.",
    }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const loginValidation = {
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
const emailValidation = {
  body: Joi.object({
    email: Joi.string().email().empty().required()
      .messages({
        "any.required": "Email is required.",
        "string.email": "Please enter a valid email",
        "string.empty": "Sorry, email cannot be an empty field",
      }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const resetPassword = {
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
    token: objectId.required().empty().messages({
      "any.required": "Token id is required.",
      "string.length": "Token id must be a valid mongoose id.",
    }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const updateUserValidation = {
  body: Joi.object({
    address: Joi.array().items(
      Joi.object({
        address_type: Joi.string().empty().messages({
          "string.empty": "Sorry, Address type cannot be an empty field",
        }),
        value: Joi.string().empty().messages({
          "string.empty": "Sorry, Value cannot be an empty field",
        }),
        place_id: Joi.string().empty().messages({
          "string.empty": "Sorry, Place id cannot be an empty field",
        }),
      })
    ),
    email: Joi.string().email().empty()
      .messages({
        "string.email": "Please enter a valid email",
        "string.empty": "Sorry, email cannot be an empty field",
      }),
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
    first_name: Joi.string().empty().messages({
      "string.empty": "Sorry, First name cannot be an empty field",
    }),
    last_name: Joi.string().empty().messages({
      "string.empty": "Sorry, Last name cannot be an empty field",
    }),
    phone_number: Joi.string().min(11).empty()
      .messages({
        "string.empty": "Sorry, phone number cannot be an empty field",
        "string.min": "Phone number should be 11 numbers"
      }),
    pushNotifications: Joi.boolean(),
    pushDeivceToken: Joi.string(),
    smsNotifications: Joi.boolean(),
    promotionalNotifications: Joi.boolean(),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const editbasketValidation = {
  body: Joi.object({
    basketId: Joi.required().empty().messages({
      "any.required": "Basket id is required.",
    }),
    product: Joi.object({
      qty: Joi.number().empty().positive()
        .messages({
          "number.empty": "Quantity cannot be an empty field.",
          "number.base": "Quantity provide a valid number.",
        }),
      productName: Joi.string().empty()
        .messages({
          "string.empty": "Sorry, Product name cannot be an empty field",
          "string.min": "Product name should be six characters or more"
        }),
      productImage: Joi.string().empty()
        .messages({
          "string.empty": "Sorry, Product image cannot be an empty field",
          "string.min": "Product image should be six characters or more"
        }),
      productId: objectId.required().empty().messages({
        "any.required": "Product id is required.",
        "string.length": "Product id must be a valid mongoose id.",
      }),
      price: Joi.number().empty().positive()
        .messages({
          "number.empty": "Price cannot be an empty field.",
          "number.base": "Please provide a valid number.",
        }),
      selectedVariants: Joi.array()
        .messages({
          "any.required": "selectedVariant should be an array."
        })
    })
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const addbasketValidation = {
  body: Joi.object({
    product: Joi.object({
      qty: Joi.number().empty().positive().required()
        .messages({
          "any.required": "Quantity is required.",
          "number.empty": "Quantity cannot be an empty field.",
          "number.base": "Quantity provide a valid number.",
        }),
      productName: Joi.string().empty().required()
        .messages({
          "any.required": "Product name is required.",
          "string.empty": "Sorry, Product name cannot be an empty field",
          "string.min": "Product name should be six characters or more"
        }),
      productImage: Joi.string().empty().required()
        .messages({
          "any.required": "Product image is required..",
          "string.empty": "Sorry, Product image cannot be an empty field",
          "string.min": "Product image should be six characters or more"
        }),
      productId: objectId.required().empty().messages({
        "any.required": "Product id is required.",
        "string.length": "Product id must be a valid mongoose id.",
      }),
      price: Joi.number().empty().positive().required()
        .messages({
          "any.required": "Price is required.",
          "number.empty": "Price cannot be an empty field.",
          "number.base": "Please provide a valid number.",
        }),
      selectedVariants: Joi.array().items(
        Joi.object({
          variantId: objectId.required().empty().messages({
            "any.required": "Variant id is required.",
            "string.empty": "Sorry, Variant id cannot be an empty field",
            "string.length": "Variant id must be a valid mongoose id.",
          }),
          variantTitle: Joi.string().empty().required().messages({
            "any.required": "Variant Title is required.",
            "string.empty": "Sorry, Variant Title cannot be an empty field",
          }),
          itemName: Joi.string().empty().required().messages({
            "any.required": "Item Name is required.",
            "string.empty": "Sorry, Item Name cannot be an empty field",
          }),
          itemPrice: Joi.number().empty().positive().required()
            .messages({
              "any.required": "Item Price is required.",
              "number.empty": "Item Price cannot be an empty field.",
              "number.base": "Please provide a valid number.",
            }),
          quantity: Joi.number().empty().positive().required()
            .messages({
              "any.required": "Quantity is required.",
              "number.empty": "Quantity cannot be an empty field.",
              "number.base": "Please provide a valid number.",
            }),
        })
      ).messages({
        "any.required": "selectedVariant should be an array."
      })
    })
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

export {
  registerValidation, emailValidation, loginValidation, resetPassword,
  addbasketValidation, updateUserValidation, editbasketValidation
};
