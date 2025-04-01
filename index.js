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

// Create SignalR connection to the hub
const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://cup-desigovm16.facilities.fsu.edu:8080/signalr/negotiate")
    .withAutomaticReconnect()
    .build();

// Set up event handlers for the connection
connection.on("ValueChanged", (message) => {
    console.log("Value changed:", message);
});

// Start the connection
connection.start().then(() => {
    console.log("Connected to SignalR hub, connection ID:", connection.connectionId);
    
    // Now use the connection ID to subscribe to values
    const requestId = "request-" + Date.now();
    
    fetch(`https://cup-desigovm16.facilities.fsu.edu:8080/api/sr/valuessubscriptions/channelize/${requestId}/${connection.connectionId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer AQAAANCMnd8BFdERjHoAwE_Cl-sBAAAA8T_TpCCVr0WS3PvirIX-SQAAAAACAAAAAAADZgAAwAAAABAAAABoXweSqCTz3buL3uU1kxuCAAAAAASAAACgAAAAEAAAAP76zt6YT5coaLCKsvUhPbKoAQAAHhpEZgQIP5LiQ-R_A_zUC3F5MlXr1GEs8pLfg4SQV6kIAIXh_aNgi4urzktyr1elmcA_MhaQE4PfC7dJybBtPoKzizs5BPjUXxIbBE46UV_2gjJa_3wvp3VkcbsHKm-93OQq7PXKj7lEi0sHQ61diMPpTDYouyN8v6oNroqyabp1PrrLMaw0AL2zDWRHOwOgPuYTwVIwJILkjOITElXFqo6hh92vbpTUCEHIpt-MpDud5THFLNieqo_mLMg9Rtm2OcUqREjnP0_JWFadrjtVLQkuqFXjJicCCTNJhxozcO0-0uwHMdeatMto4A5NQMVTapuAEATzCXuiCeqpIqD4RHZPGFNWchNH4mOondoD1wdE3aZ5fKz86Ya6TpleZG4L--uq92B46o2cf2XZMFTFsZFb_nEzX8bMTM6F41D7kxR6sqsqPYk1pzkBpRJC2F1BoNxA9KDsRLVK3Ic077-nVw-TPKIrjjNJUyf-rg2XFTGl5xBz2blhbNIS02C2WBTU1afCJmBlvh-VXXm0ovKdlMozLHQLkVX6pX35sKEwgeRGlWENj4-9dhQAAAAInp2e0_F4yXjhHGkroD4Eei51EQ" 
        },
        body: JSON.stringify({
            objectOrPropertyIds: ["System1.ManagementView:ManagementView.FieldNetworks.CUP_RD.CUP-TEST-PXC01.Points.0030_ALM_TEST1.VALUE"] 
        })
    })
    .then(response => {
        if (response.ok) {
            console.log("Successfully subscribed to value updates");
        }
    });
}).catch(err => console.error("Error connecting to SignalR hub:", err));

// Start the SignalR connection
// startConnection().catch(console.error);

// Keep the process running (for demonstration)
console.log("Press Ctrl+C to exit.");

