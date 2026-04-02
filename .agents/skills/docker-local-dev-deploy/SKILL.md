---
name: docker-local-dev-deploy
description: Work with the repo's local stack and deployment behavior. Use for compose, Dockerfiles, env vars, startup, health, or deployment-related tasks.
---

# Docker, Local Dev, and Deployment

## Goal

Use the repo's actual local and deployment model instead of treating containers as an afterthought.

## Use this when

- Working on compose, Dockerfiles, ports, env vars, health checks, local setup, or deployment behavior.

## Workflow

1. Treat the root `docker-compose.yml` as the main full-stack local environment.
2. Remember the stack includes postgres, backend, frontend, and peerjs.
3. Use `scripts/setup-local.ps1` as the intended bootstrap path when relevant.
4. Check container health, dependent service readiness, and logs first.
5. Remember compose runs the backend with Production settings.

## Avoid

- Assuming local host-run and compose-run behavior are identical.
- Changing origins, ports, or env-sensitive behavior casually.
