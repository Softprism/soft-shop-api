const checkFeedbackRangeTypes = async (req, res, next) => {
  console.log("checking");
  if (
    typeof req.query.fromStarAmount === "string"
    || typeof req.query.toStarAmount === "string"
  ) {
    res
      .status(400)
      .json({ success: false, msg: "use integer values for star amounts" });
  }
};

export default checkFeedbackRangeTypes;
