using SignalRServer.Hubs;
using SignalRServer.Services;
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file if running in development
if (builder.Environment.IsDevelopment())
{
    // Dotnet doesn't natively support .env files, but we can read the environment variables
    // that were set by the batch file
}

// Add services to the container
// Enable CORS for client applications
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policyBuilder =>
    {
        // Get CORS origins from environment variable or use default
        var corsOrigins = Environment.GetEnvironmentVariable("CORS_ORIGINS") ?? "http://localhost:8080,http://127.0.0.1:8080";
        var origins = corsOrigins.Split(',');
        
        policyBuilder
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .WithOrigins(origins);
    });
});

// Add SignalR services
builder.Services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();
builder.Services.AddSignalR();

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseRouting();

// Use CORS
app.UseCors("CorsPolicy");

// Map the hub
app.MapHub<ChatHub>("/chat");

// Add a simple status page
app.MapGet("/", () => "SignalR Server is running. Connect to /chat endpoint for SignalR hub.");

Console.WriteLine("SignalR Server starting...");

app.Run();
