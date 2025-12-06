$ErrorActionPreference = "Stop"

Write-Host "`nSetting up Eternity local environment..." -ForegroundColor Green

Write-Host "`nChecking environment..." -ForegroundColor Cyan

$wslAvailable = $false
try {
    wsl --status | Out-Null
    $wslAvailable = $true
    Write-Host "[OK] WSL detected" -ForegroundColor Green
} catch {
    Write-Host "[INFO] WSL not detected, using native Docker" -ForegroundColor Yellow
}

$dockerCmd = "docker"
if ($wslAvailable) {
    $wslDockerCheck = wsl bash -c "command -v docker" 2>$null
    if ($wslDockerCheck) {
        $dockerCmd = "wsl docker"
        Write-Host "[OK] Using Docker via WSL" -ForegroundColor Green
    }
}

Write-Host "Checking Docker daemon..." -ForegroundColor Cyan
try {
    if ($dockerCmd -eq "wsl docker") {
        wsl docker info | Out-Null
    } else {
        docker info | Out-Null
    }
    Write-Host "[OK] Docker is running" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}


if (!(Test-Path "./docker-compose.yml")) {
    Write-Host "[ERROR] docker-compose.yml not found in this directory." -ForegroundColor Red
    exit 1
}

if (!(Test-Path "./.env.local")) {
    Write-Host "[ERROR] .env.local file is missing. Cannot continue." -ForegroundColor Red
    exit 1
}

Write-Host "`nChecking if Eternity containers are already running..." -ForegroundColor Cyan

$runningContainers = if ($dockerCmd -eq "wsl docker") {
    wsl docker ps --format "{{.Names}}" | Select-String "eternity"
} else {
    docker ps --format "{{.Names}}" | Select-String "eternity"
}

if ($runningContainers) {
    Write-Host "[INFO] Existing Eternity containers detected:" -ForegroundColor Yellow
    $runningContainers | ForEach-Object { Write-Host " - $($_.ToString())" -ForegroundColor Yellow }

    Write-Host "Stopping existing environment (docker compose down)..." -ForegroundColor Yellow

    try {
        if ($dockerCmd -eq "wsl docker") {
            wsl docker compose --env-file .env.local down
        } else {
            docker compose --env-file .env.local down
        }
        Write-Host "[OK] Old containers stopped" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Failed to stop existing containers." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[OK] No running Eternity containers found" -ForegroundColor Green
}

Write-Host "`nBuilding Docker images..." -ForegroundColor Yellow

try {
    if ($dockerCmd -eq "wsl docker") {
        wsl docker compose --env-file .env.local build
    } else {
        docker compose --env-file .env.local build
    }
    Write-Host "[OK] Docker images built" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker build failed." -ForegroundColor Red
    exit 1
}

Write-Host "`nStarting services..." -ForegroundColor Yellow

try {
    if ($dockerCmd -eq "wsl docker") {
        wsl docker compose --env-file .env.local up -d
    } else {
        docker compose --env-file .env.local up -d
    }
    Write-Host "[OK] Containers started" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to start docker-compose services." -ForegroundColor Red
    exit 1
}

Write-Host "`nWaiting for health checks (10s)..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host "`nContainer status:" -ForegroundColor Cyan
if ($dockerCmd -eq "wsl docker") {
    wsl docker compose --env-file .env.local ps
} else {
    docker compose --env-file .env.local ps
}

$composeStatus = if ($dockerCmd -eq "wsl docker") {
    wsl docker compose --env-file .env.local ps --format json | ConvertFrom-Json
} else {
    docker compose --env-file .env.local ps --format json | ConvertFrom-Json
}

$unhealthy = $composeStatus | Where-Object { $_.Health -eq "unhealthy" -or $_.State -eq "exited" }

if ($unhealthy) {
    Write-Host "`n[ERROR] Some services are not healthy:" -ForegroundColor Red
    $unhealthy | ForEach-Object {
        Write-Host " - $($_.Name): $($_.State), Health: $($_.Health)" -ForegroundColor Red
    }
    Write-Host "`nCheck logs: docker compose logs -f" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup complete! All services are healthy." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nYour application runs on default ports:" -ForegroundColor Cyan
Write-Host "  Frontend:    http://localhost:18080" -ForegroundColor White
Write-Host "  Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "  Swagger:     http://localhost:5000/api" -ForegroundColor White
Write-Host "  PostgreSQL:  localhost:5432" -ForegroundColor White
Write-Host "  PGAdmin:     http://localhost:5050 (if enabled)" -ForegroundColor White

Write-Host "`nUseful commands:" -ForegroundColor Cyan
Write-Host "  View logs:" -ForegroundColor Yellow

if ($dockerCmd -eq "wsl docker") {
    Write-Host "  wsl docker compose logs -f"
} else {
    Write-Host "  docker compose logs -f"
}

Write-Host "`nStop services:" -ForegroundColor Yellow
if ($dockerCmd -eq "wsl docker") {
    Write-Host "  wsl docker compose down"
} else {
    Write-Host "  docker compose down"
}

Write-Host "`nDone!" -ForegroundColor Green
