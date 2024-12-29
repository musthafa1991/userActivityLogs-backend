const { createLogger, transports, format } = require("winston");
require("winston-mongodb");

const logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console(),
    new transports.MongoDB({
      db: process.env.MONGO_URI,
      collection: "logs",
      options: {},
    }),
  ],
});

module.exports = { logger };
