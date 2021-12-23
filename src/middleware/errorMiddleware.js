const errorHandler = (err, req, res, next) => {
  if (typeof err === "string") {
    // custom application error
    return res.status(400).json({ success: false, msg: err });
  }

  if (err.name === "ValidationError") {
    // mongoose validation error
    return res.status(400).json({ success: false, msg: err.message });
  }

  if (err.name === "CastError") {
    // mongoose cast error
    return res.status(400).json({ success: false, msg: err.message });
  }

  if (err.name === "UnauthorizedError") {
    // jwt authentication error
    return res.status(401).json({ success: false, msg: "Invalid Token" });
  }

  if (err.name === "TypeError") {
    // jwt authentication error
    return res.status(401).json({ success: false, msg: err.message });
  }

  // default to 500 server error
  console.log(err);
  return res.status(500).json({ success: false, msg: "server error" });
};

export default errorHandler;