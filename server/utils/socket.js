// Thin wrapper so controllers can emit events without importing server.js
// directly (which would create a circular require).
let io = null;

function initSocket(server) {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || "*" },
  });

  io.on("connection", (socket) => {
    // Clients join a room per survey so live updates are scoped
    // to whichever analytics dashboard they have open.
    socket.on("join:survey", (surveyId) => {
      socket.join(`survey:${surveyId}`);
    });
    socket.on("leave:survey", (surveyId) => {
      socket.leave(`survey:${surveyId}`);
    });
  });

  return io;
}

function emitNewResponse(surveyId, payload) {
  if (!io) return;
  io.to(`survey:${surveyId}`).emit("response:new", payload);
}

module.exports = { initSocket, emitNewResponse };
