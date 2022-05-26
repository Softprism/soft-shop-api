import Joi from "joi";
import validate from "../utils/validate";

const validationMiddleware = (requestSchema, auth = true) => (req, res, next) => {
  const schema = auth
    ? {
      ...requestSchema,
    }
    : requestSchema;
  let validationResult = validate(schema, req);
  if (validationResult.error) {
    return res.status(422).json({
      success: false,
      msg: validationResult.error[0],
      status: 422
    });
  } return next();
};

export default validationMiddleware;
