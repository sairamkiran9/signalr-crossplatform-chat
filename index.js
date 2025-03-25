// Node.js SignalR client example
const signalR = require("@microsoft/signalr");
require('dotenv').config();

// Create console feedback for connection status
function logStatus(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

async function startConnection() {
    // Create the connection
    // Generate a unique ID for this Node.js client
    const nodeClientId = `node-${Date.now()}`;
    
    // Use environment variable for server URL
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    
    const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${serverUrl}/chat?userId=${nodeClientId}`) // Use env variable for server URL
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

    // Set up message handler
    connection.on("ReceiveMessage", (user, message) => {
        logStatus(`Message received: ${user} says "${message}"`);
    });
    
    // Handle the SetUserId message from the server
    connection.on("SetUserId", (assignedUserId) => {
        logStatus(`Server assigned User ID: ${assignedUserId}`);
    });

    // Set up connection status handlers
    connection.onreconnecting((error) => {
        logStatus(`Connection lost due to error "${error}". Reconnecting...`);
    });

    connection.onreconnected((connectionId) => {
        logStatus(`Connection reestablished. Connected with connection ID "${connectionId}".`);
    });

    connection.onclose((error) => {
        logStatus(`Connection closed due to error "${error}". Try refreshing this page to restart the connection.`);
    });

    // Start the connection
    try {
        logStatus("Starting connection...");
        await connection.start();
        logStatus(`Connection started successfully. Connection ID: ${connection.connectionId}`);

        // For demo purposes, send a message after connecting
        await connection.invoke("SendMessage", `NodeClient_${nodeClientId}`, "Hello from Node.js!");
        logStatus("Test message sent");
    } catch (err) {
        logStatus(`Error while starting connection: ${err}`);
    }

    // Return the connection for further use
    return connection;
}

// Start the SignalR connection
startConnection().catch(console.error);

// Keep the process running (for demonstration)
console.log("Press Ctrl+C to exit.");
