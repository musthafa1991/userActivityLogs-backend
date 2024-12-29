let io;

const initSocket = (server) => {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  return io;
};

const getSocket = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized. Call initSocket first.");
  }
  return io;
};

module.exports = { initSocket, getSocket };
