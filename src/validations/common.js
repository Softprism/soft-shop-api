const Joi = require("joi");

const objectId = Joi.string()
  .length(24)
  .messages({ "string.length": "{{#label}} must be a valid id" });

export default objectId;
