// verifiy if request is coming from a store or admin account
const isStoreAdmin = (req, res, next) => {
  if (req.admin === undefined && req.store === undefined) {
    return res.status(403).json({
      success: false,
      msg: "You're not permitted to carry out this action",
    });
  } else {
    next();
  }
};

export { isStoreAdmin };
