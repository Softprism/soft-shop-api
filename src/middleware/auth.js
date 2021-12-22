import jwt from "jsonwebtoken";
import User from "../models/user.model";
import Admin from "../models/admin.model";
import Store from "../models/store.model";

const auth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization && req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // eslint-disable-next-line prefer-destructuring
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.user) {
        const { user } = decoded;
        let verifyUser = await User.findById(user.id);
        if (!verifyUser) res.status(404).json({ success: false, msg: "user doesn't exist" });
        req.user = decoded.user;
      }

      if (decoded.store) {
        const { store } = decoded;
        let verifyStore = await Store.findById(store.id);
        if (!verifyStore) res.status(404).json({ success: false, msg: "store doesn't exist" });
        req.store = decoded.store;
      }

      if (decoded.admin) {
        const { admin } = decoded;
        let verifyAdmin = await Admin.findById(admin.id);
        if (!verifyAdmin) res.status(404).json({ success: false, msg: "admin doesn't exist" });
        req.admin = decoded.admin;
      }

      next();
    } catch (err) {
      res
        .status(401)
        .json({ success: false, msg: "Session expired, you have to login." });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, msg: "Not authorized, no token." });
  }
};

export default auth;
