"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const app_1 = require("./app");
const socket_io_1 = require("socket.io"); // Import socket.io
const http_1 = __importDefault(require("http"));
// Create an HTTP server from the Express app
const server = http_1.default.createServer(app_1.app);
// Create a new instance of Socket.IO, passing the HTTP server
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // You can adjust this to specify allowed origins
        methods: ["GET", "POST"],
    },
});
// Set up socket event listeners
exports.io.on("connection", (socket) => {
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
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
