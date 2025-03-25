using Microsoft.AspNetCore.SignalR;

namespace SignalRServer.Services
{
    public class CustomUserIdProvider : IUserIdProvider
    {
        public string? GetUserId(HubConnectionContext connection)
        {
            // You can use any logic here to determine the user ID
            // For example, you can use claims, query string parameters, or headers
            
            // Example 1: Use a query string parameter
            if (connection.GetHttpContext()?.Request.Query.TryGetValue("userId", out var userId) == true)
            {
                return userId;
            }
            
            // Example 2: Use a custom header
            if (connection.GetHttpContext()?.Request.Headers.TryGetValue("X-SignalR-UserId", out var headerUserId) == true)
            {
                return headerUserId;
            }
            
            // Example 3: Generate a custom ID based on IP or other properties
            var ipAddress = connection.GetHttpContext()?.Connection.RemoteIpAddress?.ToString();
            if (!string.IsNullOrEmpty(ipAddress))
            {
                return $"user-{ipAddress}-{DateTime.UtcNow.Ticks}";
            }
            
            // Fall back to the default connection ID if all else fails
            return connection.ConnectionId;
        }
    }
}