import Admin from "../models/admin.model";
import Roles from "../models/user-roles.model";

// verifiy if request is coming from a store or admin account
const isStoreAdmin = (req, res, next) => {
  if (req.admin === undefined && req.store === undefined) {
    return res.status(403).json({
      success: false,
      msg: "You're not permitted to carry out this action",
      status: 403
    });
  }
  next();
};
const isAdmin = async (req, res, next) => {
  let verifyAdmin = await Admin.findById(req.admin.id);
  if (req.admin === undefined || verifyAdmin.verified === false || !verifyAdmin.role) {
    return res.status(403).json({
      success: false,
      msg: "You're not permitted to carry out this action",
      status: 403
    });
  }
  next();
};

// const isUserRole = (roleLevel) => (req, res, next) => {
//   if(roleLevel === )
// };
const isOwner = async (req, res, next) => {
  // find role
  let verifyAdmin = await Admin.findById(req.admin.id);
  let role = await Roles.findById(verifyAdmin.role);
  if (role.level !== 2) {
    return res.status(403).json({
      success: false,
      msg: "You don't have access to this resource",
      status: 403
    });
  }
  next();
};
const isFinance = async (req, res, next) => {
  // find role
  let verifyAdmin = await Admin.findById(req.admin.id);
  let role = await Roles.findById(verifyAdmin.role);
  console.log(!(role.level <= 3));
  if (!(role.level <= 3)) {
    return res.status(403).json({
      success: false,
      msg: "You don't have access to this resource",
      status: 403
    });
  }
  next();
};

const isSupport = async (req, res, next) => {
  // find role
  let verifyAdmin = await Admin.findById(req.admin.id);
  let role = await Roles.findById(verifyAdmin.role);
  if (!(role.level <= 4)) {
    return res.status(403).json({
      success: false,
      msg: "You don't have access to this resource",
      status: 403
    });
  }
  next();
};

const isLogistics = async (req, res, next) => {
  // find role
  let verifyAdmin = await Admin.findById(req.admin.id);
  let role = await Roles.findById(verifyAdmin.role);
  if (!(role.level <= 5)) {
    return res.status(403).json({
      success: false,
      msg: "You don't have access to this resource",
      status: 403
    });
  }
  next();
};
export {
  isStoreAdmin, isAdmin, isOwner, isFinance, isSupport, isLogistics
};
