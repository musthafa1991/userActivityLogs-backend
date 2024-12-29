const { verifyToken } = require("../utils/authUtils");

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    req.user = verifyToken(token);
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

const authenticateAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const user = verifyToken(token);
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = {
  authenticate,
  authenticateAdmin,
};
