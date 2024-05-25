const express = require("express");
const http = require("http");
const websocket = require("websocket");
const https = require("https");
const net = require("node:net");
const fs = require("fs");
const { readFileSync } = require("fs");

// Load environment variables
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

// Function to wait for the UNIX socket file to exist
const waitForSocket = (socketPath, interval) => {
  return new Promise((resolve) => {
    const checkSocket = () => {
      if (fs.existsSync(socketPath)) {
        resolve();
      } else {
        console.log(`Waiting for socket ${socketPath} to exist...`);
        setTimeout(checkSocket, interval);
      }
    };
    checkSocket();
  });
};

// Main function to start the server and handle connections
const startServer = async () => {
  const UNIX_SOCKET_PATH = process.env.UNIX_SOCKET_PATH || "/tmp/thi_drone";
  const CHECK_INTERVAL = 1000;

  try {
    await waitForSocket(UNIX_SOCKET_PATH, CHECK_INTERVAL);

    console.log(`Socket ${UNIX_SOCKET_PATH} exists. Proceeding to connect...`);

    // Connect to the UNIX-socket
    const UNIX_client_socket = net.createConnection(UNIX_SOCKET_PATH);

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
      wss.broadcast(data);
    });
  } catch (err) {
    console.error(`Error in running the server: ${err.message}`);
    setTimeout(startServer, 1500); // Retry after 1.5s
  }
};

// Start the server
startServer();
