const jwt = require("jsonwebtoken");

exports.generateToken = (email, isAdmin, id, expiresIn) => {
  return jwt.sign(
    { email: email, isAdmin: isAdmin, id: id },
    process.env.JWT_SECRET,
    {
      expiresIn: expiresIn,
    }
  );
};
exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
