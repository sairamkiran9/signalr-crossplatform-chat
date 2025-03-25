# SignalR Server for ASP.NET Core

This is a simple SignalR server implementation for ASP.NET Core.

## Prerequisites

- [.NET SDK 8.0](https://dotnet.microsoft.com/download/dotnet/8.0) or later

## How to Run

1. Open a command prompt in this directory
2. Run the following command:

```
dotnet run
```

3. The server will start on http://localhost:5000
4. The SignalR hub will be available at http://localhost:5000/chat

## Features

- Real-time chat functionality
- Connection/disconnection events
- CORS enabled for all origins (for development purposes)

## API

The server implements the following SignalR methods:

### Server Methods (called by clients)

- `SendMessage(string user, string message)`: Broadcasts a message to all connected clients

### Client Methods (called by server)

- `ReceiveMessage(string user, string message)`: Received by clients when a message is broadcast

## Testing

You can test this server with any SignalR client by connecting to the hub at `http://localhost:5000/chat`.