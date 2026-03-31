using System.Collections.Concurrent;

namespace Eternity.WebApi.Services;

/// <summary>
/// Thread-safe tracker for users in active calls via the CallHub.
/// Tracks per-session participation so the same user from different sessions
/// (e.g., mobile + desktop) can independently join calls.
/// </summary>
public class CallConnectionTracker
{
    /// <summary>
    /// Composite key for a user's session in a call.
    /// </summary>
    public record CallSessionKey(Guid UserId, Guid SessionId);

    public record CallSessionConnection(string ConnectionId, string? PeerId = null, bool AudioEnabled = true, bool VideoEnabled = true);

    /// <summary>
    /// callId → { (userId, sessionId) → connection info }
    /// </summary>
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<CallSessionKey, CallSessionConnection>> _callSessions = new();

    /// <summary>
    /// connectionId → callId (for OnDisconnectedAsync lookup)
    /// </summary>
    private readonly ConcurrentDictionary<string, string> _connectionToCall = new();

    /// <summary>
    /// connectionId → (userId, sessionId) (for OnDisconnectedAsync lookup)
    /// </summary>
    private readonly ConcurrentDictionary<string, CallSessionKey> _connectionToSessionKey = new();

    private readonly Lock _lock = new();

    public void AddSessionToCall(string callId, Guid userId, Guid sessionId, string connectionId) {
        lock (_lock) {
            var sessions = _callSessions.GetOrAdd(callId, _ => new ConcurrentDictionary<CallSessionKey, CallSessionConnection>());
            var key = new CallSessionKey(userId, sessionId);
            sessions[key] = new CallSessionConnection(connectionId);
            _connectionToCall[connectionId] = callId;
            _connectionToSessionKey[connectionId] = key;
        }
    }

    public void RemoveSessionFromCall(string callId, Guid userId, Guid sessionId, string connectionId) {
        lock (_lock) {
            var key = new CallSessionKey(userId, sessionId);
            if (_callSessions.TryGetValue(callId, out var sessions)) {
                sessions.TryRemove(key, out _);
                if (sessions.IsEmpty) {
                    _callSessions.TryRemove(callId, out _);
                }
            }
            _connectionToCall.TryRemove(connectionId, out _);
            _connectionToSessionKey.TryRemove(connectionId, out _);
        }
    }

    public void SetPeerId(string callId, Guid userId, Guid sessionId, string peerId) {
        lock (_lock) {
            var key = new CallSessionKey(userId, sessionId);
            if (_callSessions.TryGetValue(callId, out var sessions) &&
                sessions.TryGetValue(key, out var connection)) {
                sessions[key] = connection with { PeerId = peerId };
            }
        }
    }

    public void SetMediaState(string callId, Guid userId, Guid sessionId, bool audioEnabled, bool videoEnabled) {
        lock (_lock) {
            var key = new CallSessionKey(userId, sessionId);
            if (_callSessions.TryGetValue(callId, out var sessions) &&
                sessions.TryGetValue(key, out var connection)) {
                sessions[key] = connection with { AudioEnabled = audioEnabled, VideoEnabled = videoEnabled };
            }
        }
    }

    /// <summary>
    /// Look up which call a given connectionId is associated with.
    /// </summary>
    public string? GetCallIdByConnection(string connectionId) {
        _connectionToCall.TryGetValue(connectionId, out var callId);
        return callId;
    }

    /// <summary>
    /// Look up the (userId, sessionId) for a given connectionId.
    /// </summary>
    public CallSessionKey? GetSessionKeyByConnection(string connectionId) {
        _connectionToSessionKey.TryGetValue(connectionId, out var key);
        return key;
    }

    /// <summary>
    /// Get all distinct user IDs in a call (across all sessions).
    /// </summary>
    public List<Guid> GetUsersInCall(string callId) {
        if (_callSessions.TryGetValue(callId, out var sessions)) {
            return sessions.Keys.Select(k => k.UserId).Distinct().ToList();
        }
        return [];
    }

    /// <summary>
    /// Check if a specific session (not user) is already in ANY call.
    /// This enforces one-active-call-per-session.
    /// </summary>
    public bool IsSessionInAnyCall(Guid userId, Guid sessionId) {
        lock (_lock) {
            var key = new CallSessionKey(userId, sessionId);
            return _callSessions.Values.Any(sessions => sessions.ContainsKey(key));
        }
    }

    /// <summary>
    /// Check if a specific session is in a specific call.
    /// </summary>
    public bool IsSessionInCall(string callId, Guid userId, Guid sessionId) {
        lock (_lock) {
            var key = new CallSessionKey(userId, sessionId);
            return _callSessions.TryGetValue(callId, out var sessions) && sessions.ContainsKey(key);
        }
    }

    /// <summary>
    /// Get the connectionId for a specific session in a specific call.
    /// Returns null if the session is not in the call.
    /// </summary>
    public string? GetConnectionIdForSession(string callId, Guid userId, Guid sessionId) {
        lock (_lock) {
            var key = new CallSessionKey(userId, sessionId);
            if (_callSessions.TryGetValue(callId, out var sessions) &&
                sessions.TryGetValue(key, out var connection)) {
                return connection.ConnectionId;
            }
            return null;
        }
    }

    /// <summary>
    /// Check whether ANY session of this user is still connected to a given call.
    /// Used to decide whether the domain-level Leave should be called
    /// (only when the last session of a user disconnects from a call).
    /// </summary>
    public bool IsUserInCall(string callId, Guid userId) {
        lock (_lock) {
            return _callSessions.TryGetValue(callId, out var sessions)
                   && sessions.Keys.Any(k => k.UserId == userId);
        }
    }

    public static string GetCallGroup(string callId) => $"call_{callId}";

    /// <summary>
    /// Returns all existing peer registrations in a call, excluding a specific user.
    /// Used to send existing peers to a newly joined participant so they can initiate calls.
    /// </summary>
    public List<(Guid UserId, string PeerId)> GetExistingPeerRegistrations(string callId, Guid excludeUserId) {
        lock (_lock) {
            if (!_callSessions.TryGetValue(callId, out var sessions)) return [];

            return sessions
                .Where(kvp => kvp.Key.UserId != excludeUserId && kvp.Value.PeerId != null)
                .Select(kvp => (kvp.Key.UserId, kvp.Value.PeerId!))
                .ToList();
        }
    }

    /// <summary>
    /// Returns the current media state for all participants in a call, excluding a specific user.
    /// Used to send existing media states to a newly joined participant.
    /// </summary>
    public List<(Guid UserId, bool AudioEnabled, bool VideoEnabled)> GetExistingMediaStates(string callId, Guid excludeUserId) {
        lock (_lock) {
            if (!_callSessions.TryGetValue(callId, out var sessions)) return [];

            return sessions
                .Where(kvp => kvp.Key.UserId != excludeUserId)
                .GroupBy(kvp => kvp.Key.UserId)
                .Select(g => {
                    // If a user has multiple sessions, take the first one's media state
                    var first = g.First().Value;
                    return (g.Key, first.AudioEnabled, first.VideoEnabled);
                })
                .ToList();
        }
    }
}
