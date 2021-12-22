const checkFeedbackRangeTypes = async (req, res, next) => {
  req.query.fromStarAmount = Number(req.query.fromStarAmount);
  req.query.toStarAmount = Number(req.query.toStarAmount);

  if (
    typeof req.query.fromStarAmount === "string"
    || typeof req.query.toStarAmount === "string"
  ) {
    res
      .status(400)
      .json({ success: false, msg: "use integer values for star amounts" });
  }
  next();
};

export default checkFeedbackRangeTypes;
