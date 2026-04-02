# Local Development

## Main Workflow

- The main full-stack local environment is the root `docker-compose.yml`.
- Use `scripts/setup-local.ps1` when you want the full environment bootstrapped consistently.

## Services

- Frontend: Angular app served through the frontend container.
- Backend: .NET API and SignalR hubs.
- Postgres: main database.
- PeerJS: signaling server used by call flows.

## Important Notes

- Compose runs the backend with Production settings.
- Some issues only show up in compose because cookies, origins, proxying, or startup timing differ from local host-run workflows.
- Use backend `/health` plus compose health states as the first readiness check.
