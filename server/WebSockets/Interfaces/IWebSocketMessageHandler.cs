using System.Net.WebSockets;
using System.Text.Json;

namespace server.WebSockets.Interfaces;

public interface IWebSocketMessageHandler
{
    string MessageType { get; }
    Task HandleAsync(WebSocket socket, JsonElement payload);
}