using System.Net.WebSockets;
using System.Security.Claims;
using server.WebSockets;

public class WebSocketMiddleware
{
    private readonly RequestDelegate _next;
    private readonly WebSocketConnectionManager _manager;
    private readonly WebSocketMessageRouter _router;

    public WebSocketMiddleware(RequestDelegate next, WebSocketConnectionManager manager, WebSocketMessageRouter router)
    {
        _next = next;
        _manager = manager;
        _router = router;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.WebSockets.IsWebSocketRequest)
        {
            await _next(context);
            return;
        }

        var socket = await context.WebSockets.AcceptWebSocketAsync();
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            await socket.CloseAsync(WebSocketCloseStatus.PolicyViolation, "Unauthorized", CancellationToken.None);
            return;
        }

        _manager.AddSocket(userId, socket);
        await _router.ListenAsync(socket);
        await _manager.RemoveSocketAsync(userId);
    }
}