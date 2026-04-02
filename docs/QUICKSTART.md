# Quick Start Guide - Phase 0 Completion

## ✅ What's Already Done
- Project structure created
- Next.js frontend initialized
- Node.js backend with TypeScript
- Database schema ready
- OpenAI API key configured
- Cost-optimized settings applied

## 🚀 Next Steps to Complete Phase 0

### Option 1: Using Docker (Recommended)

**Step 1: Start Docker Desktop**
1. Open Docker Desktop application
2. Wait for it to fully start (whale icon in system tray)

**Step 2: Start Services**
```bash
cd "c:\Users\MOHAMMED YASEEN\OneDrive\Desktop\CBT\cbt-ai-app"
docker-compose up -d
```

**Step 3: Verify Services**
```bash
docker ps
# Should show: cbt-ai-postgres and cbt-ai-minio running
```

**Step 4: Create MinIO Bucket**
1. Open http://localhost:9001 in browser
2. Login: minioadmin / minioadmin
3. Create bucket named: `cbt-ai-audio`

---

### Option 2: Manual Setup (If Docker Issues)

**PostgreSQL:**
```bash
# Download and install PostgreSQL from:
# https://www.postgresql.org/download/windows/

# After installation, create database:
createdb -U postgres cbt_ai_db

# Run schema:
psql -U postgres -d cbt_ai_db -f database/schema.sql
```

**For S3 Storage:**
- Use AWS S3 (requires AWS account)
- Or skip for now and implement file storage later

---

## 🧪 Test the Setup

Once services are running:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Test URLs:**
- Frontend: http://localhost:3000
- Backend Health: http://localhost:3001/api/health
- MinIO Console: http://localhost:9001

---

## 💰 Cost Optimization Settings Applied

Your configuration includes:

✅ **Model**: `gpt-4o-mini` (cheapest GPT-4 model - ~$0.15 per 1M input tokens)
✅ **Max Tokens**: 500 (limits response length)
✅ **Rate Limiting**: 50 requests per 15 minutes
✅ **Daily Limit**: 100 API calls
✅ **Monthly Budget**: $10 USD cap
✅ **Audio**: 60 seconds max duration

**Estimated Costs:**
- 100 conversations/day × 500 tokens = ~$0.15/day
- Monthly estimate: ~$4.50 (well under $10 budget)

---

## 📋 Phase 0 Checklist

- [x] Repository initialized
- [x] Next.js frontend setup
- [x] Node.js backend setup
- [x] Database schema created
- [x] OpenAI API key configured
- [x] Cost optimization settings
- [x] Docker configuration files
- [ ] **Start Docker services** ← YOU ARE HERE
- [ ] Create MinIO bucket
- [ ] Test backend connection
- [ ] Test frontend connection

---

## ⚡ Quick Commands Reference

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Check service status
docker ps
```

---

## 🆘 Troubleshooting

**Docker Desktop not starting?**
- Restart your computer
- Check Windows Services for "Docker Desktop Service"
- Reinstall Docker Desktop if needed

**Port already in use?**
```bash
# Check what's using port 5432
netstat -ano | findstr :5432

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

**Database connection failed?**
- Verify Docker containers are running: `docker ps`
- Check logs: `docker-compose logs postgres`

---

## 🎯 After Phase 0

Once everything is running, we'll move to **Phase 1**:
1. User authentication (signup/login)
2. JWT token system
3. Dashboard UI
4. Chat interface
5. OpenAI integration

---

**Ready to continue?** Start Docker Desktop and run `docker-compose up -d`!
