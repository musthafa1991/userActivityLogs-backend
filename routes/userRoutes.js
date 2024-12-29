const express = require("express");
const {
  getUserById,
  updateUserById,
} = require("../controllers/userController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/profile/:id", authenticate, getUserById);
router.put("/profile/:id", authenticate, updateUserById);

module.exports = router;
