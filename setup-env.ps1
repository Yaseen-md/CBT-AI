# Setup Script for CBT AI Backend Environment

# Create .env file with configuration
$envContent = @"
# Production Environment Variables
# IMPORTANT: Keep this file secure and never commit to Git

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cbt_ai_db
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=cbt_ai_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# OpenAI API Configuration - COST OPTIMIZED
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
WHISPER_MODEL=whisper-1
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.7

# AWS S3 Configuration (MinIO for local development)
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_REGION=us-east-1
AWS_ENDPOINT=http://localhost:9000
S3_BUCKET_NAME=cbt-ai-audio
S3_AUDIO_TTL_DAYS=7
S3_FORCE_PATH_STYLE=true

# JWT Authentication
JWT_SECRET=your-jwt-secret-here-change-in-production
JWT_EXPIRES_IN=7d

# Application Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001

# Admin Configuration
ADMIN_EMAIL=admin@cbt-ai.local
ADMIN_INITIAL_PASSWORD=your-admin-password-here

# Crisis Detection
CRISIS_ALERT_EMAIL=alerts@cbt-ai.local
CRISIS_SLACK_WEBHOOK_URL=

# Rate Limiting - COST CONTROL
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
MAX_MESSAGE_LENGTH=1000
MAX_AUDIO_DURATION_SECONDS=60

# Session Configuration
SESSION_SECRET=your-session-secret-here

# Cost Control Settings
ENABLE_USAGE_LOGGING=true
DAILY_API_CALL_LIMIT=100
MONTHLY_BUDGET_LIMIT_USD=10
"@

# Write to backend/.env
$envContent | Out-File -FilePath "backend\.env" -Encoding UTF8

Write-Host "✅ Created backend/.env file with cost-optimized settings" -ForegroundColor Green
Write-Host ""
Write-Host "Cost Optimization Settings:" -ForegroundColor Cyan
Write-Host "  - Model: gpt-4o-mini (cheapest GPT-4 model)" -ForegroundColor Yellow
Write-Host "  - Max Tokens: 500 (reduced from default 2048)" -ForegroundColor Yellow
Write-Host "  - Rate Limit: 50 requests per 15 minutes" -ForegroundColor Yellow
Write-Host "  - Daily API Call Limit: 100 calls" -ForegroundColor Yellow
Write-Host "  - Monthly Budget: $10 USD" -ForegroundColor Yellow
Write-Host "  - Audio Duration: 60 seconds max" -ForegroundColor Yellow
Write-Host ""
