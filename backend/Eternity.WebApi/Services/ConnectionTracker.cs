using System.Collections.Concurrent;

namespace Eternity.WebApi.Services;

/// <summary>
/// Thread-safe tracker for SignalR connections per session.
/// A single session may have multiple browser tabs open,
/// each with its own SignalR connection. This service ensures that the session
/// is only marked offline when ALL connections are closed
/// </summary>
public class ConnectionTracker
{
    private readonly ConcurrentDictionary<Guid, ConcurrentDictionary<string, byte>> _sessionConnections = new();
    // we need lock because ConcurrentDictionary does not guarantee check-then-act race condition
    private readonly Lock _lock = new();
    
    public bool AddConnection(Guid sessionId, string connectionId) {
        lock (_lock) {
            var connections = _sessionConnections.GetOrAdd(sessionId, _ => new ConcurrentDictionary<string, byte>());
            var wasEmpty = connections.IsEmpty;
            connections.TryAdd(connectionId, 0);
            return wasEmpty;
        }
    }
    
    public bool RemoveConnection(Guid sessionId, string connectionId) {
        lock (_lock) {
            if (!_sessionConnections.TryGetValue(sessionId, out var connections)) {
                return false;
            }
            connections.TryRemove(connectionId, out _);
            if (!connections.IsEmpty) return false;
            _sessionConnections.TryRemove(sessionId, out _);
            return true;
        }
    }
    
    public bool HasActiveConnections(Guid sessionId) {
        lock (_lock) {
            return _sessionConnections.TryGetValue(sessionId, out var connections) && !connections.IsEmpty;
        }
    }
    
    public static string GetSessionGroup(Guid sessionId) => $"session_{sessionId}";
}
