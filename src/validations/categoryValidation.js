import Joi from "joi";

const create_category = {
  body: Joi.object({
    name: Joi.string().required().empty().messages({
      "string.empty": "Sorry, Category name cannot be an empty field",
      "any.required": "Name is required.",
    }),
    image: Joi.array(),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

const updateCategory = {
  body: Joi.object({
    name: Joi.string().empty().messages({
      "string.empty": "Sorry, Category name cannot be an empty field"
    }),
    image: Joi.array(),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

export { create_category, updateCategory };
