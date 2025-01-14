import { app } from "./app";
import { Server } from "socket.io"; // Import socket.io
import http from "http";

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Create a new instance of Socket.IO, passing the HTTP server
export const io = new Server(server, {
  cors: {
    origin: "*", // You can adjust this to specify allowed origins
    methods: ["GET", "POST"],
  },
});

// Set up socket event listeners
io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Example: listen for status updates from the frontend
  socket.on("statusUpdate", (status) => {
    console.log(`Status update from client: ${status}`);
  });

  // Emit a message to the client when they connect
  socket.emit("statusUpdate", "Connected to the server");

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Use the HTTP server with Socket.IO
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
