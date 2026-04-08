# 🎉 Phase 2 Complete - Voice Recording & Whisper Integration

## ✅ What's Been Built

### Backend Components

| File | Purpose |
|------|---------|
| `backend/src/services/minio.service.ts` | S3/MinIO file upload, download, delete operations |
| `backend/src/services/whisper.service.ts` | OpenAI Whisper transcription service |
| `backend/src/controllers/audio.controller.ts` | Audio upload + transcription + message creation |
| `backend/src/middleware/upload.middleware.ts` | Multer configuration for file uploads |
| `backend/src/routes/audio.routes.ts` | Audio API endpoints |
| `backend/src/index.ts` | Updated with audio routes |

### Frontend Components

| File | Purpose |
|------|---------|
| `frontend/src/hooks/useAudioRecorder.ts` | MediaRecorder API hook for recording |
| `frontend/src/components/AudioRecorder.tsx` | Recording UI modal component |
| `frontend/src/app/chat/[id]/page.tsx` | Updated chat page with audio support |
| `frontend/src/lib/api.ts` | Updated to support FormData uploads |
| `frontend/.env.local` | Frontend environment configuration |

### Infrastructure

| File | Purpose |
|------|---------|
| `setup-minio-bucket.ps1` | PowerShell script to create MinIO bucket |
| `backend/.env` | Backend environment configuration |

---

## 🚀 How to Use Voice Recording

### 1. Start All Services

```bash
# Start Docker (PostgreSQL + MinIO)
docker-compose up -d

# Start backend
cd backend
npm install  # Dependencies already include aws-sdk and multer
npm run dev

# Start frontend (new terminal)
cd frontend
npm install
npm run dev
```

### 2. Create MinIO Bucket

Run the setup script:
```powershell
.\setup-minio-bucket.ps1
```

Or manually:
1. Open MinIO Console: http://localhost:9501
2. Login: `minioadmin` / `minioadmin`
3. Create bucket: `cbt-ai-audio`

### 3. Test Voice Recording

1. Open http://localhost:3000
2. Register/Login
3. Start a new session
4. Click the **microphone icon** next to the text input
5. Allow microphone permissions
6. Record your message
7. Stop recording and preview
8. The audio will be:
   - Uploaded to MinIO
   - Transcribed via Whisper
   - Sent as a message
   - AI will respond to your transcription

---

## 📡 API Endpoints

### POST /api/audio/upload

Upload audio file for transcription and optional message creation.

**Request:**
```
POST /api/audio/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- audio: <audio file> (required)
- conversationId: <uuid> (optional)
```

**Response (transcription only):**
```json
{
  "success": true,
  "audioUrl": "http://localhost:9500/cbt-ai-audio/audio/user-id/123456_abc123.webm",
  "transcription": "I've been feeling anxious lately..."
}
```

**Response (with conversation):**
```json
{
  "success": true,
  "audioUrl": "http://localhost:9500/cbt-ai-audio/audio/user-id/123456_abc123.webm",
  "transcription": "I've been feeling anxious lately...",
  "userMessage": { ... },
  "aiMessage": { ... }
}
```

### DELETE /api/audio/:key

Delete audio file from storage.

```
DELETE /api/audio/audio/user-id/123456_abc123.webm
Authorization: Bearer <token>
```

---

## 💰 Cost Breakdown

| Service | Cost | Notes |
|---------|------|-------|
| Whisper API | ~$0.006/min | Transcription |
| MinIO (local) | Free | Self-hosted |
| S3 (production) | ~$0.023/GB/month | Audio storage |

**Estimated monthly cost** for 100 voice messages/day (avg 1 min each):
- Whisper: ~$18/month
- S3 storage: ~$0.50/month (with 7-day TTL)

---

## 🔧 Configuration

### Environment Variables

```bash
# Whisper Configuration
WHISPER_MODEL=whisper-1
OPENAI_API_KEY=your_key_here

# MinIO/S3 Configuration
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_REGION=us-east-1
AWS_ENDPOINT=http://localhost:9500
S3_BUCKET_NAME=cbt-ai-audio
S3_FORCE_PATH_STYLE=true

# Upload Limits
MAX_AUDIO_DURATION_SECONDS=60
```

### Supported Audio Formats

- WebM (default, recommended)
- MP4
- MP3
- WAV
- OGG

---

## 🎨 UI Features

### Recording Modal
- Real-time timer display
- Recording visualization (animated bars)
- Pause/Resume support
- Audio preview before sending
- Error handling for microphone permissions

### Chat Display
- Audio player for voice messages
- Transcription display below player
- Upload progress indicator
- Microphone button in input bar

---

## 🧪 Testing Checklist

- [ ] Microphone permissions granted
- [ ] Recording starts and stops correctly
- [ ] Timer displays accurate time
- [ ] Audio preview works
- [ ] Upload to MinIO succeeds
- [ ] Whisper transcription returns text
- [ ] Message appears in chat with audio player
- [ ] Transcription displays correctly
- [ ] AI responds to transcribed message
- [ ] Error handling works (no mic, network failure)

---

## 🐛 Troubleshooting

### "Microphone access denied"
- Check browser permissions
- Clear site settings and re-allow

### "Failed to upload audio"
- Verify MinIO is running: `docker ps`
- Check bucket exists: http://localhost:9501
- Verify `.env` has correct AWS settings

### "Transcription failed"
- Check OpenAI API key is valid
- Verify Whisper model is available
- Check audio format is supported

### "No speech detected"
- Speak clearly into microphone
- Check microphone is working (test in OS settings)
- Try recording in a quieter environment

---

## 📁 File Structure

```
cbt-ai-app/
├── backend/
│   ├── .env                      # Created/Updated
│   └── src/
│       ├── index.ts              # Updated: audio routes
│       ├── controllers/
│       │   └── audio.controller.ts   # NEW
│       ├── middleware/
│       │   └── upload.middleware.ts  # NEW
│       ├── routes/
│       │   └── audio.routes.ts       # NEW
│       └── services/
│           ├── minio.service.ts      # NEW
│           └── whisper.service.ts    # NEW
├── frontend/
│   ├── .env.local                # NEW
│   └── src/
│       ├── app/chat/[id]/
│       │   └── page.tsx          # Updated: audio support
│       ├── components/
│       │   └── AudioRecorder.tsx # NEW
│       ├── hooks/
│       │   └── useAudioRecorder.ts # NEW
│       └── lib/
│           └── api.ts            # Updated: FormData support
└── setup-minio-bucket.ps1        # NEW
```

---

## 🎯 What's Next? (Phase 3)

Phase 3 will add:
- **Memory & Journaling System**
  - Session summaries
  - User journal entries
  - Cognitive distortion tagging
  - Mood tracking over time

---

## 🎊 Celebration!

**Phase 2 is complete!** 🎉

Your CBT AI app now supports:
- ✅ Text-based chat with AI therapist
- ✅ Voice recording via microphone
- ✅ Automatic transcription with Whisper
- ✅ Audio playback in chat
- ✅ Secure storage with MinIO/S3

**Total implementation**: 6 new files + 3 updated files
