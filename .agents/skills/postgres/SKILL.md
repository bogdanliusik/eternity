---
name: postgres
description: Handle PostgreSQL, EF Core, migrations, and query behavior safely. Use for schema changes, indexes, migrations, or query-performance work.
---

# PostgreSQL, EF Core, and Migrations

## Goal

Handle schema changes, query behavior, and data access safely in the current PostgreSQL plus EF Core setup.

## Use this when

- Changing entities, configurations, migrations, indexes, or query performance.

## Workflow

1. Review nearby entity configurations and recent migrations first.
2. Keep EF configuration in Infrastructure.
3. Add a migration only when the schema actually changes.
4. Keep migration diffs focused.
5. Review query shape, projection, `AsNoTracking()`, indexes, and N+1 risk for read-heavy changes.
6. Build the backend and verify against a local database flow when feasible.

## Remember

- EF Core uses Npgsql and snake_case naming.
- Startup applies migrations and seed logic.

## Avoid

- Hand-editing snapshots unless clearly necessary.
- Treating startup success as enough database validation.
