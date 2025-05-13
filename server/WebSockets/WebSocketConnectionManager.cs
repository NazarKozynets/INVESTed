using System.Collections.Concurrent;
using System.Net.WebSockets;

namespace server.WebSockets;

public class WebSocketConnectionManager
{
    private readonly ConcurrentDictionary<string, WebSocket> _sockets = new();

    public void AddSocket(string userId, WebSocket socket)
    {
        _sockets[userId] = socket;
    }

    public WebSocket? GetSocket(string userId)
    {
        _sockets.TryGetValue(userId, out var socket);
        return socket;
    }

    public async Task RemoveSocketAsync(string userId)
    {
        if (_sockets.TryRemove(userId, out var socket))
        {
            if (socket.State == WebSocketState.Open)
                await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Disconnected", CancellationToken.None);
        }
    }

    public IEnumerable<(string UserId, WebSocket Socket)> GetAllConnections()
    {
        return _sockets.Select(kvp => (kvp.Key, kvp.Value));
    }
}