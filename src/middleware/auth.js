import jwt from "jsonwebtoken";
import User from "../models/user.model";
import Admin from "../models/admin.model";
import Store from "../models/store.model";
import Rider from "../models/rider.model";
import Logistics from "../models/logistics-company.model";

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
        if (!verifyUser) res.status(404).json({ success: false, msg: "user doesn't exist", status: 404 });
        req.user = decoded.user;
      }

      if (decoded.store) {
        const { store } = decoded;
        let verifyStore = await Store.findById(store.id);
        if (!verifyStore) res.status(404).json({ success: false, msg: "store doesn't exist", status: 404 });
        req.store = decoded.store;
      }

      if (decoded.admin) {
        const { admin } = decoded;
        let verifyAdmin = await Admin.findById(admin.id);
        if (!verifyAdmin) res.status(404).json({ success: false, msg: "admin doesn't exist", status: 404 });
        req.admin = decoded.admin;
      }

      if (decoded.rider) {
        const { rider } = decoded;
        let verifyRider = await Rider.findById(rider.id);
        if (!verifyRider) res.status(404).json({ success: false, msg: "rider doesn't exist", status: 404 });
        req.rider = verifyRider;
      }

      if (decoded.logistics) {
        const { logistics } = decoded;
        let verifyLogistics = await Logistics.findById(logistics.id);
        if (!verifyLogistics) res.status(404).json({ success: false, msg: "logistics company doesn't exist", status: 404 });
        req.logistics = verifyLogistics;
      }
      next();
    } catch (err) {
      res
        .status(401)
        .json({ success: false, msg: "Session expired, you have to login.", status: 401 });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, msg: "Not authorized, no token.", status: 401 });
  }
};

export default auth;
