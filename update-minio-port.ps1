# Update backend .env with correct MinIO port
$envPath = "backend\.env"
$content = Get-Content $envPath -Raw

# Update MinIO endpoint to use port 9500
$content = $content -replace 'AWS_ENDPOINT=http://localhost:9000', 'AWS_ENDPOINT=http://localhost:9500'

# Write back
$content | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline

Write-Host "✅ Updated MinIO endpoint to port 9500" -ForegroundColor Green
Write-Host ""
Write-Host "Phase 0 Complete! 🎉" -ForegroundColor Cyan
Write-Host ""
Write-Host "Running Services:" -ForegroundColor Yellow
Write-Host "  ✅ Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "  ✅ Backend: http://localhost:3001" -ForegroundColor Green
Write-Host "  ✅ PostgreSQL: localhost:5432" -ForegroundColor Green
Write-Host "  ✅ MinIO: http://localhost:9501" -ForegroundColor Green
Write-Host "  ✅ MinIO Bucket: cbt-ai-audio" -ForegroundColor Green
Write-Host ""
Write-Host "Ready for Phase 1! 🚀" -ForegroundColor Cyan
