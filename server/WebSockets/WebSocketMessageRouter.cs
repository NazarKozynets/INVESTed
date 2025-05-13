using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using server.WebSockets.Interfaces;
using server.WebSockets.Models;

namespace server.WebSockets;

public class WebSocketMessageRouter
{
    private readonly Dictionary<string, IWebSocketMessageHandler> _handlers;

    public WebSocketMessageRouter(IEnumerable<IWebSocketMessageHandler> handlers)
    {
        _handlers = handlers.ToDictionary(h => h.MessageType);
    }

    public async Task ListenAsync(WebSocket socket)
    {
        var buffer = new byte[4096];

        while (socket.State == WebSocketState.Open)
        {
            var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            if (result.MessageType == WebSocketMessageType.Close)
                break;

            var json = Encoding.UTF8.GetString(buffer, 0, result.Count);
            var msg = JsonSerializer.Deserialize<WebSocketMessageBase>(json);

            if (msg != null && _handlers.TryGetValue(msg.Type, out var handler))
            {
                await handler.HandleAsync(socket, msg.Payload);
            }
        }
    }
}