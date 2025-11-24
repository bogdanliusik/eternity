# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["Eternity.WebApi/Eternity.WebApi.csproj", "Eternity.WebApi/"]
COPY ["Eternity.Application/Eternity.Application.csproj", "Eternity.Application/"]
COPY ["Eternity.Domain/Eternity.Domain.csproj", "Eternity.Domain/"]
COPY ["Eternity.Infrastructure/Eternity.Infrastructure.csproj", "Eternity.Infrastructure/"]

RUN dotnet restore "Eternity.WebApi/Eternity.WebApi.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/Eternity.WebApi"
RUN dotnet build "Eternity.WebApi.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "Eternity.WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Install curl and wget for health checks
USER root
RUN apt-get update && \
    apt-get install -y curl wget && \
    rm -rf /var/lib/apt/lists/*
# =========================================

# Create non-root user for security
RUN addgroup --system --gid 1000 appuser && \
    adduser --system --uid 1000 --ingroup appuser --shell /bin/sh appuser

# Copy published app
COPY --from=publish /app/publish .

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "Eternity.WebApi.dll"]