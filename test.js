// DOM Elements
const baseUrlInputEl = document.getElementById('baseUrlInput');
const usernameInputEl = document.getElementById('usernameInput');
const passwordInputEl = document.getElementById('passwordInput');
const getTokenButtonEl = document.getElementById('getTokenButton');
const tokenValueEl = document.getElementById('tokenValue');
const tokenInputEl = document.getElementById('tokenInput');
const jsonBodyInputEl = document.getElementById('jsonBodyInput');
const connectButtonEl = document.getElementById('connectButton');
const disconnectButtonEl = document.getElementById('disconnectButton');
const clearLogButtonEl = document.getElementById('clearLogButton');
const statusLogEl = document.getElementById('statusLog');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Variables to store connection
let connection = null;
let connectionId = null;

// Tab functionality
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        // Add active class to clicked tab
        tab.classList.add('active');

        // Show corresponding content
        const tabId = tab.dataset.tab;
        document.getElementById(`${tabId}Tab`).classList.add('active');
    });
});

// Add log message
function log(message, isError = false) {
    const timestamp = new Date().toISOString();
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${timestamp}] ${message}`;
    if (isError) {
        logEntry.className = 'error';
    }
    statusLogEl.appendChild(logEntry);
    statusLogEl.scrollTop = statusLogEl.scrollHeight;
}

// Get token button handler
getTokenButtonEl.addEventListener('click', async () => {
    try {
        const baseUrl = baseUrlInputEl.value.trim();
        const username = usernameInputEl.value.trim();
        const password = passwordInputEl.value.trim();

        if (!baseUrl || !username || !password) {
            log("Error: Base URL, username, and password are required", true);
            return;
        }

        log("Requesting access token...");

        // Create form data
        const formData = new URLSearchParams();
        formData.append('grant_type', 'password');
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${baseUrl}/api/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
        }

        const tokenData = await response.json();

        if (!tokenData.access_token) {
            throw new Error("No access token in response");
        }

        log("Access token received successfully");

        // Display the token
        tokenValueEl.textContent = tokenData.access_token;
        tokenValueEl.style.display = "block";

        // Auto-fill in the connection tab
        tokenInputEl.value = tokenData.access_token;

        // Get connection ID from negotiate
        connectionId = await getNegotiateConnectionId(baseUrl, tokenData.access_token);

        // Switch to connection tab
        tabs[1].click();

    } catch (error) {
        log(`Error getting token: ${error.message}`, true);
    }
});

// Get connection ID from negotiate endpoint
async function getNegotiateConnectionId(baseUrl, token) {
    try {
        log("Calling negotiate endpoint to get connection ID...");

        const response = await fetch(`${baseUrl}/signalr/negotiate`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Negotiate failed: ${response.status} ${response.statusText}`);
        }

        const negotiateData = await response.json();
        log(`Negotiate successful. Connection ID: ${negotiateData.ConnectionId}`);

        return negotiateData.ConnectionId;
    } catch (error) {
        log(`Error in negotiate: ${error.message}`, true);
        throw error;
    }
}

// Connect button handler
connectButtonEl.addEventListener('click', async () => {
    try {
        const baseUrl = baseUrlInputEl.value.trim();
        const token = tokenInputEl.value.trim();
        let jsonBody;

        // Validate inputs
        if (!baseUrl) {
            log("Error: Base URL is required", true);
            return;
        }

        if (!token) {
            log("Error: Access token is required", true);
            return;
        }

        if (!connectionId) {
            log("Error: Connection ID is required. Please authenticate first.", true);
            return;
        }

        // Parse JSON body
        try {
            jsonBody = JSON.parse(jsonBodyInputEl.value);
        } catch (parseError) {
            log(`Error parsing JSON body: ${parseError.message}`, true);
            return;
        }

        // Generate a unique request ID
        const requestId = "req-" + Date.now();

        // Set up jQuery AJAX defaults for authorization
        $.ajaxSetup({
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }
        });

        // Create connection using the older SignalR client
        log("Creating SignalR connection...");
        connection = $.hubConnection(`${baseUrl}/signalr/hubs`);

        console.log(connection)
        connection.qs = { "connectionId": connectionId };

        // Connection status handlers
        connection.reconnecting(function () {
            log("Connection lost. Reconnecting...", true);
        });

        connection.reconnected(function () {
            log("Connection reestablished.");
        });

        connection.disconnected(function () {
            log("Connection closed.");
            connectButtonEl.disabled = false;
            disconnectButtonEl.disabled = true;
        });

        // Start the connection
        log(`Starting connection... for ${connectionId}`);
        connection.start()
            .done(function () {
                log(`Connected to hub with Connection ID: ${connectionId}`);

                // Set up headers with authorization for the API call
                const headers = {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                };

                // Subscribe to values
                log(`Subscribing to values with Request ID: ${requestId}`);
                log(`Request body: ${JSON.stringify(jsonBody)}`);

                fetch(`${baseUrl}/api/sr/valuessubscriptions/channelize/${requestId}/${connectionId}`, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(jsonBody)
                })
                    .then(response => {
                        if (response.ok) {
                            const successMsg = "Successfully subscribed to values";
                            log(successMsg);
                            const successEl = document.createElement('div');
                            successEl.textContent = successMsg;
                            successEl.className = 'connected';
                            statusLogEl.appendChild(successEl);

                            connectButtonEl.disabled = true;
                            disconnectButtonEl.disabled = false;
                        } else {
                            return response.text().then(errorText => {
                                log(`Failed to subscribe. Status: ${response.status} ${response.statusText}`, true);
                                log(`Error details: ${errorText}`, true);
                                log("Disconnecting due to subscription failure...", true);
                                connection.stop();
                            });
                        }
                    })
                    .catch(error => {
                        log(`Error in subscription request: ${error.message}`, true);
                        connection.stop();
                    });
            })
            .fail(function (error) {
                log(`Error starting connection: ${error}`, true);
                connectButtonEl.disabled = false;
                disconnectButtonEl.disabled = true;
            });

           // Create a proxy for the hub
            var hubProxy = connection.createHubProxy('valuesHub');

            console.log(hubProxy)

            // Register the client methods
            hubProxy.on('notifySubscriptionStatus', function(data) {
                console.log('Subscription status received:', data);
                // Process status update
            });

            hubProxy.on('notifyValues', function(data) {
                console.log('values received:', data);
            });

            console.log("done")


    } catch (error) {
        log(`Error: ${error.message}`, true);
        if (connection) {
            connection.stop();
        }
        connectButtonEl.disabled = false;
        disconnectButtonEl.disabled = true;
    }
});

// Modified disconnect handler for the jQuery-based SignalR
disconnectButtonEl.addEventListener('click', () => {
    if (connection) {
        try {
            log("Disconnecting...");
            connection.stop();
            log("Disconnected");
            connectButtonEl.disabled = false;
            disconnectButtonEl.disabled = true;
        } catch (error) {
            log(`Error disconnecting: ${error.message}`, true);
        }
    }
});

// Clear log button handler
clearLogButtonEl.addEventListener('click', () => {
    statusLogEl.innerHTML = '';
    log("Log cleared");
});

// Load from localStorage
window.addEventListener('load', () => {
    baseUrlInputEl.value = localStorage.getItem('baseUrl') || baseUrlInputEl.value;
    usernameInputEl.value = localStorage.getItem('username') || usernameInputEl.value;
    tokenInputEl.value = localStorage.getItem('token') || '';
    jsonBodyInputEl.value = localStorage.getItem('jsonBody') || jsonBodyInputEl.value;
});

// Save to localStorage
window.addEventListener('beforeunload', () => {
    localStorage.setItem('baseUrl', baseUrlInputEl.value);
    localStorage.setItem('username', usernameInputEl.value);
    localStorage.setItem('token', tokenInputEl.value);
    localStorage.setItem('jsonBody', jsonBodyInputEl.value);
});