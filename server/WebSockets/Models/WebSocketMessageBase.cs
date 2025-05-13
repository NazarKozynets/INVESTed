using System.Text.Json;

namespace server.WebSockets.Models;

public class WebSocketMessageBase
{
    public string Type { get; set; } = default!;
    public JsonElement Payload { get; set; }
}