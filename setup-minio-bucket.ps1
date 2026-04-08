# MinIO Bucket Setup Script for CBT AI
# This script creates the required bucket in MinIO

$MINIO_ENDPOINT = "http://localhost:9500"
$MINIO_ACCESS_KEY = "minioadmin"
$MINIO_SECRET_KEY = "minioadmin"
$BUCKET_NAME = "cbt-ai-audio"

Write-Host "Setting up MinIO bucket: $BUCKET_NAME" -ForegroundColor Cyan

# Check if MinIO is running
try {
    $response = Invoke-WebRequest -Uri "$MINIO_ENDPOINT/minio/health/live" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "MinIO is running" -ForegroundColor Green
} catch {
    Write-Host "Error: MinIO is not running. Please start Docker with: docker-compose up -d" -ForegroundColor Red
    exit 1
}

# Create bucket using MinIO Admin API
$authHeader = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$MINIO_ACCESS_KEY:$MINIO_SECRET_KEY"))

$headers = @{
    Authorization = "Basic $authHeader"
}

# Create bucket via S3 API
$bucketUrl = "$MINIO_ENDPOINT/$BUCKET_NAME"

try {
    # Try to create bucket using PUT request
    $request = [System.Net.WebRequest]::Create($bucketUrl)
    $request.Method = "PUT"
    $request.Headers.Add("Authorization", "Basic $authHeader")
    $request.ContentLength = 0

    $response = $request.GetResponse()
    Write-Host "Bucket '$BUCKET_NAME' created successfully!" -ForegroundColor Green
    $response.Close()
} catch {
    # Bucket might already exist
    Write-Host "Bucket might already exist or error occurred: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`nMinIO Console: http://localhost:9501" -ForegroundColor Cyan
Write-Host "Login with: minioadmin / minioadmin" -ForegroundColor Gray
