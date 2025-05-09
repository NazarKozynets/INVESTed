using System.Net.WebSockets;
using System.Collections.Concurrent;
using System.Text;

namespace server.Services
{
    public class WebSocketConnectionManager
    {
        private readonly ConcurrentDictionary<string, WebSocket> _sockets = new();

        public string AddSocket(WebSocket socket)
        {
            var socketId = Guid.NewGuid().ToString();
            _sockets.TryAdd(socketId, socket);
            return socketId;
        }

        public async Task RemoveSocket(string socketId)
        {
            if (_sockets.TryRemove(socketId, out var socket))
            {
                await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed by the WebSocketManager", CancellationToken.None);
                socket.Dispose();
            }
        }

        public async Task SendMessageAsync(string socketId, string message)
        {
            if (_sockets.TryGetValue(socketId, out var socket))
            {
                if (socket.State == WebSocketState.Open)
                {
                    var buffer = Encoding.UTF8.GetBytes(message);
                    await socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }
        }

        public async Task SendMessageToAllAsync(string message)
        {
            foreach (var socket in _sockets.Values)
            {
                if (socket.State == WebSocketState.Open)
                {
                    var buffer = Encoding.UTF8.GetBytes(message);
                    await socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }
        }
    }
}