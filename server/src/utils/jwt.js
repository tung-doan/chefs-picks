const jwt = require("jsonwebtoken");

const signToken = (payload, options = {}) => {
  const secret = process.env.JWT_SECRET || "dev-secret";
  const defaultOpts = { expiresIn: "7d" };
  return jwt.sign(payload, secret, { ...defaultOpts, ...options });
};

module.exports = { signToken };
