const checkPagination = (req, res, next) => {
  if (req.query.page === undefined || req.query.limit === undefined) {
    return res
      .status(400)
      .json({ success: false, msg: "pagination parameters are missing" });
  }
  req.query.skip = (req.query.page - 1) * req.query.limit;
  next();
};

export { checkPagination };
