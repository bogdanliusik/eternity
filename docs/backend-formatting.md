# Backend Formatting and Analysis

This document describes the backend formatting and analyzer workflow for the .NET solution in `backend/`.

## Source Of Truth

- `backend/.editorconfig` defines the shared formatting and analyzer configuration.
- `backend/Directory.Build.props` enables the shared analyzer baseline for all backend projects.
- `dotnet format` is the authoritative formatter for backend code.

## Commands

Run from `backend/`:

```bash
dotnet format Eternity.sln
dotnet format Eternity.sln --verify-no-changes
dotnet build Eternity.sln
```

Use `dotnet format Eternity.sln --verify-no-changes` in CI.

If you only want to format specific files locally, `dotnet format` also supports `--include` paths.

## Rider Workflow

Rider/ReSharper reads `backend/.editorconfig`, including JetBrains-specific keys, so it can help with local formatting and cleanup.

Recommended local workflow:

1. Use Rider `Reformat Code` or `Reformat and Cleanup Code` while editing.
2. Before commit, run `dotnet format Eternity.sln` from `backend/`.
3. Run `dotnet build Eternity.sln`.

## Important Note About Rider

Rider and Roslyn do not use the same formatting engine.

- Rider cleanup can still introduce wrapping or indentation that differs from Roslyn.
- `dotnet format` is the final authority for code that will be validated in CI.

That means after a Rider refactor or cleanup pass, you should still run:

```bash
dotnet format Eternity.sln
```

## Analyzer Baseline

- The backend uses the analyzers built into the .NET 10 SDK.
- No `Microsoft.CodeAnalysis.NetAnalyzers` package is required.
- `AnalysisLevel` is pinned to `10-recommended` for stable CI behavior.
- `EnforceCodeStyleInBuild` is enabled so practical style diagnostics are visible during build.

## Migrations

EF Core migrations and the snapshot have relaxed formatter/analyzer overrides in `backend/.editorconfig`.
They are treated as tool-owned files unless a task specifically requires editing them.
