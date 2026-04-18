---
name: backend-formatting
description: Handle backend formatting, analyzer config, and Rider/Roslyn divergence. Use when touching .editorconfig, Directory.Build.props, or investigating formatting issues.
---

# Backend Formatting

## Source of truth

- `backend/.editorconfig` -- formatting rules and analyzer settings.
- `backend/Directory.Build.props` -- `AnalysisLevel` pinned to `10-recommended`, `EnforceCodeStyleInBuild` enabled.
- `dotnet format Eternity.sln` -- authoritative formatter, always wins over IDE formatting.

## Commands

From `backend/`:

```bash
dotnet format Eternity.sln                    # apply formatting
dotnet format Eternity.sln --verify-no-changes # check without modifying (CI mode)
dotnet format Eternity.sln --include <path>    # format specific files
dotnet build Eternity.sln                      # verify build after formatting
```

## Rider divergence

Rider and Roslyn use different formatting engines. Rider cleanup can introduce wrapping or indentation that `dotnet format` disagrees with. Always run `dotnet format Eternity.sln` after Rider refactors or cleanup passes.

## Key style rules

- Type braces on new line; method and control braces on same line.
- 4-space indent, 120 char max line, LF endings, file-scoped namespaces.
- Braces required for all control flow.
- No extra blank lines near braces or between properties.
- Analyzers: no external analyzer packages -- .NET 10 SDK built-in analyzers only.

## Verification

- Run `dotnet format Eternity.sln --verify-no-changes` then `dotnet build Eternity.sln` after any backend change.
- No automated test coverage exists; do not assume test projects exist.

## Migrations

EF Core migrations and snapshots have relaxed formatter/analyzer overrides in `.editorconfig`. Treat them as tool-owned files unless a task specifically requires editing them.
