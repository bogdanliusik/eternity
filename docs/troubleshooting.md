# Troubleshooting Notes

## Common Failure Areas

- cookie auth and session validity
- SignalR connection or reconnect behavior
- PeerJS media permissions and connection setup
- startup migration or seed behavior
- compose health failures and dependent service startup order
- light or dark theme regressions after UI changes

## Useful Starting Checks

- Confirm whether the issue reproduces in host-run mode, compose mode, or both.
- Check whether the problem is frontend-only, backend-only, auth-related, real-time-related, or data-related.
- Compare the failing flow with a nearby working flow in the repository.
