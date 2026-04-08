<p align="center">
  <h1 align="center">🧠 CBT AI — Cognitive Behavioral Therapy Assistant</h1>
  <p align="center">
    An AI-powered mental health support application built with modern web technologies.<br/>
    Evidence-based CBT techniques • Real-time conversations • Privacy-first design
  </p>
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/Phase_5-Complete-brightgreen?style=flat-square" alt="Phase 5 Complete"/></a>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express" alt="Express"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/PostgreSQL-14-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=flat-square&logo=openai&logoColor=white" alt="OpenAI"/>
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License"/>
</p>

---

## 📖 Overview

**CBT AI** is a full-stack web application that delivers Cognitive Behavioral Therapy support through an empathetic AI therapist named **Thera**. It helps users identify and challenge negative thought patterns, manage anxiety, and develop healthier cognitive habits — all within a secure, privacy-respecting environment.

> **⚠️ Disclaimer:** CBT AI is an AI-powered support tool and is **NOT a substitute** for professional mental health care.

---

## ✨ Features

### Core Functionality
- **AI-Powered CBT Sessions** — Real-time therapeutic conversations using OpenAI GPT-4o-mini with a carefully crafted CBT system prompt
- **Thought Challenging** — Guided Socratic questioning to identify cognitive distortions
- **Session Persistence** — Full conversation history with session management
- **Secure Authentication** — JWT-based auth with bcrypt password hashing and HTTP-only cookies

### User Experience
- **Modern Dashboard** — Quick access to sessions, conversation history, and CBT tools
- **Responsive Design** — Optimized for desktop and mobile
- **Beautiful UI** — Gradient-rich landing page with smooth transitions
- **Real-time Chat** — Instant AI responses with typing indicators

### Technical Highlights
- **Cost-Optimized AI** — Configured with token limits, rate limiting, and monthly budget caps
- **Configurable LLM** — Support for OpenAI API, local LLM (Ollama), or hybrid setups
- **SQL Injection Safe** — Parameterized queries throughout
- **Docker-Ready** — One-command infrastructure setup

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Next.js 16    │────▶│  Express 5 API   │────▶│ PostgreSQL   │
│   React 19      │◀────│  TypeScript      │◀────│ 14 + pgvector│
│   TailwindCSS   │     │  JWT Auth        │     └──────────────┘
└─────────────────┘     │  Rate Limiting   │     ┌──────────────┐
     :3000              │                  │────▶│ OpenAI API   │
                        └──────────────────┘     │ GPT-4o-mini  │
                             :3001               └──────────────┘
                                                 ┌──────────────┐
                                                 │ MinIO / S3   │
                                                 │ Audio Storage│
                                                 └──────────────┘
```

### Project Structure

```
cbt-ai-app/
├── frontend/                # Next.js application
│   └── src/
│       ├── app/
│       │   ├── page.tsx             # Landing page
│       │   ├── login/page.tsx       # Login
│       │   ├── signup/page.tsx      # Registration
│       │   ├── dashboard/page.tsx   # User dashboard
│       │   └── chat/[id]/page.tsx   # Chat interface
│       ├── contexts/
│       │   └── AuthContext.tsx       # Auth state management
│       └── lib/
│           └── api.ts               # API client
├── backend/                 # Express.js API server
│   └── src/
│       ├── index.ts                 # Server entry
│       ├── db.ts                    # Database connection
│       ├── controllers/             # Request handlers
│       ├── routes/                  # API routes
│       ├── middleware/              # Auth, validation, errors
│       └── services/               # OpenAI integration
├── database/
│   └── schema.sql                   # PostgreSQL schema
├── shared/                  # Shared TypeScript types
├── docs/                    # Additional documentation
├── docker-compose.yml       # Dev infrastructure
└── .env.example             # Environment template
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js     | 18+     |
| npm         | 9+      |
| Docker      | 20+     |
| Git         | 2.30+   |

### 1. Clone the Repository

```bash
git clone https://github.com/Yaseen-md/CBT-AI.git
cd CBT-AI
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `OPENAI_API_KEY` | Your OpenAI API key ([get one here](https://platform.openai.com/api-keys)) |
| `JWT_SECRET` | Random secret for token signing |
| `AWS_ACCESS_KEY_ID` | S3/MinIO access key |
| `AWS_SECRET_ACCESS_KEY` | S3/MinIO secret key |

### 3. Start Infrastructure

```bash
# Start PostgreSQL and MinIO via Docker
docker-compose up -d

# Verify services are running
docker ps
```

### 4. Install Dependencies & Run

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### 5. Access the Application

| Service | URL |
|---------|-----|
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend API | [http://localhost:3001](http://localhost:3001) |
| Health Check | [http://localhost:3001/api/health](http://localhost:3001/api/health) |
| MinIO Console | [http://localhost:9501](http://localhost:9501) |

---

## 🗄️ Database Schema

| Table | Purpose | Status |
|-------|---------|--------|
| `users` | Authentication & user profiles | ✅ Active |
| `conversations` | Chat session metadata | ✅ Active |
| `messages` | Chat message history | ✅ Active |
| `memories` | Journal entries & session summaries | ✅ Active |
| `safety_events` | Crisis detection audit logs | ✅ Active |

---

## 🔐 Security

| Feature | Implementation |
|---------|---------------|
| Password Hashing | bcrypt (12 rounds) |
| Authentication | JWT with HTTP-only cookies |
| Input Validation | express-validator |
| SQL Safety | Parameterized queries |
| CORS | Configured with credentials |
| Resource Isolation | Per-user ownership checks |

---

## 📋 Development Roadmap

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 0** | Project Setup & Infrastructure | ✅ Complete |
| **Phase 1** | Authentication & Basic Chat | ✅ Complete |
| **Phase 2** | Voice Recording & Whisper Integration | ✅ Complete |
| **Phase 3** | Memory & Journaling System | ✅ Complete |
| **Phase 4** | Crisis Detection & Safety System | ✅ Complete |
| **Phase 5** | Admin Dashboard & Testing | ✅ Complete |
| **Phase 6** | Vector Memory, Scaling & Deployment | ⏳ In Progress |

---

## 🛠️ Available Scripts

### Frontend

```bash
npm run dev       # Start dev server (port 3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

### Backend

```bash
npm run dev       # Start with hot-reload (port 3001)
npm run build     # Compile TypeScript
npm run start     # Start production server
npm run test      # Run test suite
```

### Infrastructure

```bash
docker-compose up -d      # Start PostgreSQL + MinIO
docker-compose down        # Stop all services
docker-compose logs -f     # Stream service logs
```

---

## 💰 Cost Optimization

CBT AI is configured for minimal API costs:

| Setting | Value |
|---------|-------|
| Model | `gpt-4o-mini` (~$0.15/1M input tokens) |
| Max Tokens | 500 per response |
| Rate Limit | 50 requests / 15 min |
| Daily Cap | 100 API calls |
| Monthly Budget | ~$10 USD |
| Est. Monthly Cost | ~$4.50 (100 conversations/day) |

---

## 🔧 LLM Configuration

CBT AI supports multiple LLM providers:

| Provider | Use Case |
|----------|----------|
| **OpenAI** (default) | Cloud-hosted, high quality |
| **Ollama** (local) | Self-hosted, zero API cost |
| **Hybrid** | Local primary + cloud fallback |

Set `LLM_PROVIDER` in your `.env` to `openai`, `local`, or `hybrid`.

See [CUSTOM_LLM_PLAN.md](./docs/CUSTOM_LLM_PLAN.md) for detailed local LLM setup instructions.

---

## ⚠️ Mental Health Disclaimer

**CBT AI is an AI-powered support tool and is NOT a substitute for professional mental health care.**

If you or someone you know is in crisis, please reach out:

| Resource | Contact |
|----------|---------|
| **Emergency Services** | 911 (US) or your local emergency number |
| **Suicide & Crisis Lifeline** | **988** (US) |
| **Crisis Text Line** | Text **HOME** to **741741** |
| **International Resources** | [IASP Crisis Centres](https://www.iasp.info/resources/Crisis_Centres/) |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For questions, bugs, or feature requests, please [open an issue](https://github.com/Yaseen-md/CBT-AI/issues).

---

<p align="center">
  <strong>Built with ❤️ for mental health support</strong><br/>
  <sub>By <a href="https://github.com/Yaseen-md">Yaseen</a></sub>
</p>
