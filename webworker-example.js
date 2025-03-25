// This is a Web Worker script that uses SignalR

// Import the SignalR client library
// In a real application, you would need to copy the SignalR JS file to an accessible location
importScripts('node_modules/@microsoft/signalr/dist/webworker/signalr.js');

// Create the connection
const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/chat") // Local SignalR server URL (absolute URL for WebWorker)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

// Send messages back to the main thread
function postMessage(type, data) {
    self.postMessage({
        type: type,
        data: data,
        timestamp: new Date().toISOString()
    });
}

// Set up message handler
connection.on("ReceiveMessage", (user, message) => {
    postMessage("messageReceived", { user, message });
});

// Set up connection status handlers
connection.onreconnecting((error) => {
    postMessage("status", `Connection lost. Reconnecting... Error: ${error}`);
});

connection.onreconnected((connectionId) => {
    postMessage("status", `Connection reestablished. ID: ${connectionId}`);
});

connection.onclose((error) => {
    postMessage("status", `Connection closed. Error: ${error}`);
});

// Handle messages from the main thread
self.onmessage = async function(e) {
    const command = e.data;
    
    switch (command.type) {
        case "connect":
            try {
                postMessage("status", "Starting connection...");
                await connection.start();
                postMessage("status", `Connected successfully. ID: ${connection.connectionId}`);
            } catch (err) {
                postMessage("error", `Connection error: ${err}`);
            }
            break;
            
        case "disconnect":
            try {
                await connection.stop();
                postMessage("status", "Disconnected");
            } catch (err) {
                postMessage("error", `Error during disconnect: ${err}`);
            }
            break;
            
        case "sendMessage":
            try {
                if (connection.state === signalR.HubConnectionState.Connected) {
                    await connection.invoke("SendMessage", command.user, command.message);
                    postMessage("messageSent", { user: command.user, message: command.message });
                } else {
                    postMessage("error", "Cannot send message. Connection not established.");
                }
            } catch (err) {
                postMessage("error", `Error sending message: ${err}`);
            }
            break;
            
        default:
            postMessage("error", `Unknown command: ${command.type}`);
    }
};

// Initial status
postMessage("status", "Web Worker initialized. Ready to connect.");
