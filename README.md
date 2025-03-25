# SignalR Realtime Connect

A proof-of-concept project demonstrating real-time communication between Node.js and .NET Core using SignalR.

> **IMPORTANT NOTE:** This project is designed for learning and exploring SignalR ASP.NET Core functionality. It demonstrates the project structure and MVC design pattern of the .NET framework in a cross-platform communication scenario.

## Features

- Bidirectional real-time communication
- Node.js client support
- Browser client support (including WebWorker)
- Custom user ID support
- Automatic reconnection handling
- Cross-platform compatibility

## Prerequisites

- [.NET Core SDK](https://dotnet.microsoft.com/download) (5.0 or later)
- [Node.js](https://nodejs.org/) (14.x or later)
- npm or yarn package manager

## Environment Setup

This project uses environment variables to avoid hardcoded values. Create a `.env` file in the root directory with the following configuration:

```
# Server Configuration
SERVER_URL=http://localhost:5000
SERVER_PORT=5000

# Client Configuration
CLIENT_PORT=8080

# Other Settings
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/signalr-realtime-connect.git
   cd signalr-realtime-connect
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the demo:
   ```
   ./run-demo.bat
   ```
   or manually start server and client:
   ```
   # Terminal 1 - Start SignalR Server
   cd SignalRServer
   dotnet run

   # Terminal 2 - Start Node.js client
   node index.js

   # Terminal 3 - Start browser example
   npx live-server --port=8080 --open=browser-example.html
   ```

## Project Structure

- **SignalRServer/** - .NET Core SignalR server
  - **Hubs/** - SignalR Hub definitions
  - **Services/** - Custom services (e.g., UserIdProvider)
- **index.js** - Node.js client example
- **browser-example.html** - Browser client example
- **webworker-example.html** - WebWorker client example
- **custom-id-example.html** - Custom user ID example
- **run-demo.bat** - Demo startup script

## SignalR Client Usage Examples

### Browser

```javascript
let connection = new signalR.HubConnectionBuilder()
    .withUrl("/chat")
    .build();

connection.on("ReceiveMessage", (user, message) => {
    console.log(`${user}: ${message}`);
});

connection.start()
    .then(() => connection.invoke("SendMessage", "User", "Hello from browser!"));
```

### WebWorker

```javascript
importScripts('signalr.js');

let connection = new signalR.HubConnectionBuilder()
    .withUrl("https://example.com/chat")
    .build();

connection.on("ReceiveMessage", (user, message) => {
    console.log(`${user}: ${message}`);
});

connection.start()
    .then(() => connection.invoke("SendMessage", "Worker", "Hello from WebWorker!"));
```

### Node.js

```javascript
const signalR = require("@microsoft/signalr");
require('dotenv').config();

const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${serverUrl}/chat`)
    .build();

connection.on("ReceiveMessage", (user, message) => {
    console.log(`${user}: ${message}`);
});

connection.start()
    .then(() => connection.invoke("SendMessage", "Node", "Hello from Node.js!"));
```

## Additional Resources

- [SignalR Documentation](https://learn.microsoft.com/aspnet/core/signalr/)
- [SignalR API Reference](https://learn.microsoft.com/javascript/api/@microsoft/signalr/)
- [SignalR Service Serverless Guide](https://learn.microsoft.com/azure/azure-signalr/signalr-concept-serverless-development-config)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
