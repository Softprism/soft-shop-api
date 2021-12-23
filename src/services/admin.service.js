import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import Admin from "../models/admin.model";

const getAdmins = async () => {
  const admins = await Admin.find();
  return admins;
};

const registerAdmin = async (params) => {
  const { username, password } = params;

  let admin = await Admin.findOne({ username });

  if (admin) {
    return { err: "Admin account already exists.", status: 409 };
  }

  // Create Admin Object
  admin = new Admin({
    username,
    password,
  });

  const salt = await bcrypt.genSalt(10);

  // Replace password from user object with encrypted one
  admin.password = await bcrypt.hash(password, salt);

  // Save user to db
  await admin.save();

  // Define payload for token
  const payload = {
    admin: {
      id: admin.id,
    },
  };

  // Generate and return token to server
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: 36000,
  });

  return token;
};

const loginAdmin = async (loginParam) => {
  const { username, password } = loginParam;
  // Find admin with email
  let admin = await Admin.findOne({ username });

  if (!admin) {
    return { err: "Admin not found.", status: 404 };
  }

  // Check if password matches with stored hash
  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    return { err: "The password entered is invalid, please try again.", status: 401 };
  }

  // Define payload for token
  const payload = {
    admin: {
      id: admin.id,
    },
  };

  // Generate and return token to server
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: 36000,
  });

  if (!token) {
    return { err: "Missing Token", status: 400 };
  }

  return token;
};

const getLoggedInAdmin = async (adminParam) => {
  const admin = await Admin.findById(adminParam).select("-password");

  return admin;
};

const updateAdmin = async (updateParam, id) => {
  const { username, password } = updateParam;

  // Build Admin Object
  const adminFields = {};

  // Check for fields
  if (username) adminFields.username = username;
  if (password) {
    const salt = await bcrypt.genSalt(10);

    // Replace password from admin object with encrypted one
    adminFields.password = await bcrypt.hash(password, salt);
  }

  try {
    // Find admin from DB Collection
    let admin = await Admin.findById(id);

    if (!admin) return { msg: "Admin not found.", status: 404 };

    // Updates the admin Object with the changed values
    admin = await Admin.findByIdAndUpdate(
      id,
      { $set: adminFields },
      { omitUndefined: true, new: true, useFindAndModify: false }
    );

    return admin;
  } catch (err) {
    return err;
  }
};

export {
  getAdmins, registerAdmin, loginAdmin, getLoggedInAdmin, updateAdmin
};
