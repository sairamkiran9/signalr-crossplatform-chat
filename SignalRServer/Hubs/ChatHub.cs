using Microsoft.AspNetCore.SignalR;

namespace SignalRServer.Hubs
{
    public class ChatHub : Hub
    {
        // Method that clients will call to send a message
        public async Task SendMessage(string user, string message)
        {
            // Broadcast the message to all connected clients
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        // Called when a new client connects
        public override async Task OnConnectedAsync()
        {
            string userId = Context.UserIdentifier ?? Context.ConnectionId;
            
            // Log the connection with both ConnectionId and UserIdentifier
            Console.WriteLine($"Client connected - ConnectionId: {Context.ConnectionId}, UserId: {userId}");
            
            // Send the userId back to the connecting client
            await Clients.Caller.SendAsync("SetUserId", userId);
            
            // Notify all clients that someone joined
            await Clients.All.SendAsync("ReceiveMessage", "System", $"User connected: {userId}");
            
            await base.OnConnectedAsync();
        }

        // Called when a client disconnects
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            string userId = Context.UserIdentifier ?? Context.ConnectionId;
            
            // Log the disconnection
            Console.WriteLine($"Client disconnected - ConnectionId: {Context.ConnectionId}, UserId: {userId}");
            
            // Notify all clients that someone left
            await Clients.All.SendAsync("ReceiveMessage", "System", $"User disconnected: {userId}");
            
            await base.OnDisconnectedAsync(exception);
        }
    }
}