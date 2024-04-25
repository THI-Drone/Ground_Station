const express = require("express");
const http = require("http");
const websocket = require("websocket");
const net = require("node:net");

// Load environement variables
require("dotenv").config();

// Declare server, host static files from public/
const app = express();
app.use(express.static("public"));
let server;

// Check if we have a certificate to initialize the server with
if (process.env.HTTPS_CERT_PATH && process.env.HTTPS_KEY_PATH) {
  const key = readFileSync(process.env.HTTPS_KEY_PATH);
  const cert = readFileSync(process.env.HTTPS_CERT_PATH);
  server = new https.Server({ key, cert }, app);
} else {
  server = new http.Server(app);
}

// Connect to the UNIX-socket
const UNIX_client_socket = net.createConnection(process.env.UNIX_SOCKET_PATH || "/tmp/thi_drone");

// Start to listen with server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Initiate web-socket on server
const wss = new websocket.server({
  httpServer: server,
  autoAcceptConnections: false,
  keepaliveInterval: 5000,
});

// Accept connections on "drone-logging"
wss.on("request", async function (request) {
  request.accept("drone-logging", request.origin);
});

// Broadcast all data received on the UNIX-socket to all web-socket clients
UNIX_client_socket.on("data", (data) => {
  console.log("Sending", data.toString(), "to all clients.");
  wss.broadcast(data);
});
