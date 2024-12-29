const express = require("express");
const { getLogs } = require("../controllers/logController");
const { authenticateAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authenticateAdmin, getLogs);

module.exports = router;
