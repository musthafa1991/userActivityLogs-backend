const { getAuditLogs } = require("../models/logModel");

const getLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.pageSize) || 10;

    const skip = (page - 1) * limit;

    const filters = {};

    if (req.query.user) {
      filters.userEmail = req.query.user;
    }

    if (req.query.action) {
      filters.action = req.query.action;
    }

    if (req.query.date) {
      const date = new Date(req.query.date);

      if (!isNaN(date)) {
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        filters.timestamp = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    const logs = await getAuditLogs(filters)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const totalLogs = await getAuditLogs(filters).countDocuments();

    const totalPages = Math.ceil(totalLogs / limit);

    res.status(200).json({
      logs,
      totalLogs,
      totalPages,
      currentPage: page,
      pageSize: limit,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  getLogs,
};
