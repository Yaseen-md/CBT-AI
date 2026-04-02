# Database Setup Guide

## Prerequisites
- PostgreSQL 14 or higher installed
- `psql` command-line tool available

## Setup Instructions

### 1. Create Database

```bash
# Using psql
psql -U postgres

# In psql console
CREATE DATABASE cbt_ai_db;
\q
```

Or using command line directly:
```bash
createdb -U postgres cbt_ai_db
```

### 2. Run Schema Migration

```bash
# From the database directory
psql -U postgres -d cbt_ai_db -f schema.sql
```

### 3. Verify Tables Created

```bash
psql -U postgres -d cbt_ai_db

# In psql console
\dt
# Should show: users, conversations, messages, memories, safety_events

\q
```

### 4. Update Environment Variables

Update your `.env` file with the database connection string:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/cbt_ai_db
```

## Database Schema Overview

### Tables

1. **users** - User accounts and authentication
2. **conversations** - Chat sessions
3. **messages** - Individual messages in conversations
4. **memories** - Journal entries and session summaries
5. **safety_events** - Crisis detection logs

### Key Features

- UUID primary keys for all tables
- Cascade deletion for user data privacy
- JSONB support for flexible tags
- Automatic `updated_at` triggers
- Indexes for performance optimization
- pgvector support (Phase 6) for semantic search

## Useful Commands

### Connect to Database
```bash
psql -U postgres -d cbt_ai_db
```

### View Table Structure
```sql
\d users
\d conversations
\d messages
\d memories
\d safety_events
```

### Drop and Recreate (Development Only)
```bash
# WARNING: This will delete all data!
dropdb -U postgres cbt_ai_db
createdb -U postgres cbt_ai_db
psql -U postgres -d cbt_ai_db -f schema.sql
```

### Backup Database
```bash
pg_dump -U postgres cbt_ai_db > backup.sql
```

### Restore Database
```bash
psql -U postgres -d cbt_ai_db < backup.sql
```

## Next Steps

After setting up the database:
1. Test connection from backend
2. Create database client/ORM configuration
3. Implement migration system (optional)
4. Set up database seeding for development
