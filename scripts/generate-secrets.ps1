Write-Host "Generating secure secrets for production..." -ForegroundColor Green
Write-Host ""

# Generate JWT secret
$bytes = New-Object byte[] 64
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$JWT_SECRET = [Convert]::ToBase64String($bytes)
Write-Host "JWT_SECRET_KEY=$JWT_SECRET"
Write-Host ""

# Generate PostgreSQL password
$bytes = New-Object byte[] 32
$rng.GetBytes($bytes)
$POSTGRES_PASS = [Convert]::ToBase64String($bytes)
Write-Host "POSTGRES_PASSWORD=$POSTGRES_PASS"
Write-Host ""

Write-Host "Copy these values to your .env file" -ForegroundColor Yellow
Write-Host "IMPORTANT: Keep these secrets safe and never commit them to git!" -ForegroundColor Red