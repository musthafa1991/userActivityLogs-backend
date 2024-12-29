const mongoose = require("mongoose");

exports.connectToDatabase = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to database");
};
