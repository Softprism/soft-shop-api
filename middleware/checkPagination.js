const checkPagination = (req, res, next) => {
  if (req.query.page === undefined || req.query.limit === undefined) {
    return res
      .status(400)
      .json({ success: false, msg: "pagination parameters are missing" });
  } else if (req.query.page == 0 || req.query.limit == 0) {
    return res
      .status(400)
      .json({ success: false, msg: "zeroes aren't allowed" });
  }
  req.query.skip = (req.query.page - 1) * req.query.limit;
  req.query.skip = Number(req.query.skip);
  req.query.limit = Number(req.query.limit);
  next();
};

export { checkPagination };
