const mongoose = require("mongoose");
const logSchema = new mongoose.Schema({
  userId: { type: String, default: null }, 
  userEmail: { type: String, default: null },
  action: { type: String, required: true },
  details: {
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
  },
  timestamp: { type: Date, default: Date.now },
});

const Log = mongoose.model("Log", logSchema);
exports.createLog = (data) => new Log(data).save();

exports.getAuditLogs = (filters) => {
  return Log.find(filters).sort({ timestamp: -1 });
};
