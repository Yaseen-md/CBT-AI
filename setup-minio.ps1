# MinIO Setup Script

Write-Host "🪣 Setting up MinIO bucket for CBT AI..." -ForegroundColor Cyan
Write-Host ""

# Install MinIO Client (mc) if not already installed
$mcPath = "mc.exe"
if (-not (Get-Command $mcPath -ErrorAction SilentlyContinue)) {
    Write-Host "📥 Downloading MinIO Client..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://dl.min.io/client/mc/release/windows-amd64/mc.exe" -OutFile "mc.exe"
    Write-Host "✅ MinIO Client downloaded" -ForegroundColor Green
}

# Configure MinIO alias
Write-Host "🔧 Configuring MinIO connection..." -ForegroundColor Yellow
.\mc.exe alias set local http://localhost:9500 minioadmin minioadmin

# Create bucket
Write-Host "🪣 Creating bucket: cbt-ai-audio..." -ForegroundColor Yellow
.\mc.exe mb local/cbt-ai-audio --ignore-existing

# Set bucket policy to private
Write-Host "🔒 Setting bucket policy..." -ForegroundColor Yellow
.\mc.exe anonymous set none local/cbt-ai-audio

# Verify bucket
Write-Host ""
Write-Host "✅ MinIO Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "MinIO Console: http://localhost:9501" -ForegroundColor Cyan
Write-Host "Username: minioadmin" -ForegroundColor Cyan
Write-Host "Password: minioadmin" -ForegroundColor Cyan
Write-Host ""
Write-Host "Bucket created: cbt-ai-audio" -ForegroundColor Green
