import Joi from "joi";
import validate from "../utils/validate";

const validationMiddleware = (requestSchema, auth = true) => (req, res, next) => {
  // if it's an authentication protected route, add an authorization header to the validation rule
  const schema = auth
    ? {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).required(),
      ...requestSchema,
    }
    : requestSchema;
  let validationResult = validate(schema, req);
  if (validationResult.error) {
    return res.status(422).json({
      success: false,
      msg: "Some parameters failed validation",
      errors: validationResult.error,
    });
  } return next();
};

export default validationMiddleware;
