const express = require("express");
require("dotenv").config();
const cors = require("cors");
const http = require("http");
// const { initSocket } = require("./utils/socket");

const { connectToDatabase } = require("./utils/database");
const { logger } = require("./utils/logger");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const logRoutes = require("./routes/logRoutes");

const app = express();

// const server = http.createServer(app);
// const io = initSocket(server);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "https://useractivitylogs.netlify.app",
    // origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to User Activity Logging System API");
});
// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/logs", logRoutes);

// io.on("connection", (socket) => {
//   console.log("A user connected");

//   socket.on("admin_login", (userData) => {
//     if (userData.role === "admin") {
//       console.log("Admin user connected");
//       socket.join("admin");
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("A user disconnected");
//   });
// });

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server and connect to database
connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
