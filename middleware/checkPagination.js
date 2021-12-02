const checkPagination = (req, res, next) => {
  if (req.query.skip === undefined || req.query.limit === undefined) {
    return res
      .status(400)
      .json({ success: false, msg: "pagination parameters are missing" });
  }
  next();
};

export { checkPagination };
