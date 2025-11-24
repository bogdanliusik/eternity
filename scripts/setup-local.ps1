Write-Host "Setting up Eternity local environment..." -ForegroundColor Green
Write-Host ""

# Check if WSL is available
$wslAvailable = $false
try {
    wsl --status | Out-Null
    $wslAvailable = $true
    Write-Host "[OK] WSL detected" -ForegroundColor Green
} catch {
    Write-Host "[INFO] WSL not detected, checking Docker Desktop..." -ForegroundColor Cyan
}

# Determine Docker command (WSL or native)
$dockerCmd = "docker"
if ($wslAvailable) {
    $wslDockerCheck = wsl bash -c "command -v docker" 2>$null
    if ($wslDockerCheck) {
        $dockerCmd = "wsl docker"
        Write-Host "[OK] Using Docker through WSL" -ForegroundColor Green
    }
}

# Check if Docker is running
try {
    if ($dockerCmd -eq "wsl docker") {
        wsl docker info | Out-Null
    } else {
        docker info | Out-Null
    }
    Write-Host "[OK] Docker is running" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}


# Check and update hosts file
Write-Host ""
Write-Host "Checking hosts file configuration..." -ForegroundColor Yellow
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$hostsContent = Get-Content $hostsPath -ErrorAction SilentlyContinue

if ($hostsContent -notcontains "127.0.0.1    eternity.localhost") {
    Write-Host "Adding eternity.localhost to hosts file (requires Administrator)..." -ForegroundColor Yellow
    
    # Check if running as admin
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    $isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if ($isAdmin) {
        Add-Content -Path $hostsPath -Value "`n127.0.0.1    eternity.localhost"
        Write-Host "[OK] Added eternity.localhost to hosts file" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Please run this script as Administrator to update hosts file" -ForegroundColor Red
        Write-Host "Or manually add this line to hosts file:" -ForegroundColor Yellow
        Write-Host "127.0.0.1    eternity.localhost" -ForegroundColor White
        Write-Host ""
        Write-Host "Press Enter to continue anyway or Ctrl+C to exit..."
        Read-Host
    }
} else {
    Write-Host "[OK] eternity.localhost already in hosts file" -ForegroundColor Green
}

# Build Docker images
Write-Host ""
Write-Host "Building Docker images..." -ForegroundColor Yellow
if ($dockerCmd -eq "wsl docker") {
    wsl docker compose --env-file .env.local build
} else {
    docker compose --env-file .env.local build
}

# Start services
Write-Host ""
Write-Host "Starting services..." -ForegroundColor Yellow
if ($dockerCmd -eq "wsl docker") {
    wsl docker compose --env-file .env.local up -d
} else {
    docker compose --env-file .env.local up -d
}

# Wait for services
Write-Host ""
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service health
Write-Host ""
Write-Host "Checking service health..." -ForegroundColor Yellow
if ($dockerCmd -eq "wsl docker") {
    wsl docker compose --env-file .env.local ps
} else {
    docker compose --env-file .env.local ps
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your application is available at:" -ForegroundColor Cyan
Write-Host "  Frontend:    http://eternity.localhost" -ForegroundColor White
Write-Host "  Backend API: http://eternity.localhost/api" -ForegroundColor White
Write-Host "  Swagger:     http://eternity.localhost/api" -ForegroundColor White
Write-Host "  Health:      http://eternity.localhost/health" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host ""
Write-Host "View logs:" -ForegroundColor Yellow
if ($dockerCmd -eq "wsl docker") {
    Write-Host "  wsl docker compose --env-file .env.local logs -f" -ForegroundColor White
} else {
    Write-Host "  docker compose --env-file .env.local logs -f" -ForegroundColor White
}
Write-Host ""
Write-Host "Stop services:" -ForegroundColor Yellow
if ($dockerCmd -eq "wsl docker") {
    Write-Host "  wsl docker compose --env-file .env.local down" -ForegroundColor White
} else {
    Write-Host "  docker compose --env-file .env.local down" -ForegroundColor White
}
Write-Host ""