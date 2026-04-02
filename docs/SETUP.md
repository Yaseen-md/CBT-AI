# Phase 0 Setup Instructions

## ✅ Completed

We've successfully set up the foundational infrastructure for the CBT AI application:

### 1. Project Structure Created
```
cbt-ai-app/
├── frontend/          # Next.js 14+ with TypeScript & Tailwind CSS
├── backend/           # Node.js + Express + TypeScript
├── database/          # PostgreSQL schema and migrations
├── shared/            # Shared types (to be populated)
├── docs/              # Documentation
├── .gitignore         # Git ignore rules
├── .env.example       # Environment variable template
└── README.md          # Project documentation
```

### 2. Frontend Setup (Next.js)
- ✅ Next.js 14+ initialized with TypeScript
- ✅ Tailwind CSS configured
- ✅ ESLint configured
- ✅ App Router structure
- ✅ Source directory structure

### 3. Backend Setup (Node.js + Express)
- ✅ TypeScript configuration
- ✅ Express server with CORS
- ✅ Database client module (`db.ts`)
- ✅ Health check endpoint
- ✅ Dependencies installed:
  - express, cors, dotenv
  - jsonwebtoken, bcryptjs
  - pg (PostgreSQL client)
  - openai
  - @aws-sdk/client-s3, multer
  - TypeScript and dev dependencies

### 4. Database Schema
- ✅ Complete PostgreSQL schema created
- ✅ Tables: users, conversations, messages, memories, safety_events
- ✅ Indexes for performance
- ✅ Triggers for auto-updating timestamps
- ✅ UUID support
- ✅ JSONB support for tags
- ✅ pgvector placeholder for Phase 6

---

## 🔄 Remaining Tasks

To complete Phase 0, you need to:

### 1. Set Up PostgreSQL Database

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (if not already installed)
# Windows: Download from https://www.postgresql.org/download/windows/

# Create database
createdb -U postgres cbt_ai_db

# Run schema
cd database
psql -U postgres -d cbt_ai_db -f schema.sql
```

**Option B: Docker PostgreSQL**
```bash
# Run PostgreSQL in Docker
docker run --name cbt-ai-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cbt_ai_db \
  -p 5432:5432 \
  -d postgres:14

# Wait a few seconds, then run schema
psql -h localhost -U postgres -d cbt_ai_db -f database/schema.sql
```

### 2. Obtain OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-...`)
4. Add to backend `.env` file

### 3. Set Up S3 Storage

**Option A: AWS S3 (Production)**
1. Create AWS account
2. Create S3 bucket (e.g., `cbt-ai-audio-dev`)
3. Create IAM user with S3 access
4. Get Access Key ID and Secret Access Key

**Option B: MinIO (Local Development)**
```bash
# Run MinIO in Docker
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  quay.io/minio/minio server /data --console-address ":9001"

# Access MinIO console at http://localhost:9001
# Create bucket: cbt-ai-audio-dev
```

### 4. Configure Environment Variables

Create `backend/.env` file (copy from `.env.example`):
```bash
cd backend
cp ../.env.example .env
```

Then edit `.env` and fill in:
- `DATABASE_URL` - Your PostgreSQL connection string
- `OPENAI_API_KEY` - Your OpenAI API key
- `AWS_ACCESS_KEY_ID` - Your AWS/MinIO access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS/MinIO secret key
- `JWT_SECRET` - Generate a random secret (e.g., `openssl rand -base64 32`)

### 5. Test the Setup

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Visit:
- Frontend: http://localhost:3000
- Backend Health: http://localhost:3001/api/health

---

## 📝 Next Steps After Phase 0

Once Phase 0 is complete, we'll move to **Phase 1: Authentication & Basic Chat**:

1. User registration and login
2. JWT authentication
3. Dashboard UI
4. Chat interface
5. OpenAI integration with CBT system prompt

---

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -U postgres -d cbt_ai_db -c "SELECT NOW();"
```

### Port Already in Use
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Node Modules Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Phase 0 Progress: 90% Complete

**Completed:**
- ✅ Repository initialization
- ✅ Git configuration
- ✅ Next.js frontend setup
- ✅ Node.js backend setup
- ✅ Database schema creation
- ✅ Environment templates
- ✅ Documentation

**Remaining:**
- ⏳ Create actual PostgreSQL database
- ⏳ Obtain OpenAI API key
- ⏳ Set up S3/MinIO storage
- ⏳ Test full stack connectivity

Let me know when you're ready to complete these steps or if you need help with any of them!
