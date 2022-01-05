import jwt from "jsonwebtoken";

const getJwt = async (id, type) => {
  let payload;
  if (type === "store") {
    payload = {
      store: {
        id,
      },
    };
  }
  if (type === "user") {
    payload = {
      user: {
        id,
      },
    };
  }
  if (type === "admin") {
    payload = {
      admin: {
        id,
      },
    };
  }

  if (type === "rider") {
    payload = {
      rider: {
        id,
      },
    };
  }

  // Generate and return token to server
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "365 days",
  });

  if (!token) {
    throw { err: "Missing Token.", status: 400 };
  }
  return token;
};

export default getJwt;
