# 🚀 Quick Start Guide - Mukhattat

This guide will help you get the Mukhattat project up and running quickly.

## Prerequisites

Before starting, make sure you have installed:
- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **PostgreSQL 15+** (database)
- **Redis 7+** (for Celery and caching)
- **Docker & Docker Compose** (optional, for easier setup)

---

## Option 1: Using Docker (Recommended) 🐳

This is the easiest way to run everything.

### Step 1: Clone and Setup

```bash
# Navigate to project directory
cd mukhattat

# Copy environment file
cp backend/.env.example backend/.env
```

### Step 2: Start All Services

```bash
# Start all services (database, redis, backend, frontend, celery)
docker-compose up -d

# Check if all services are running
docker-compose ps
```

### Step 3: Setup Database

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser (optional)
docker-compose exec backend python manage.py createsuperuser

# Load seed data (creates test users and sample data)
docker-compose exec backend python manage.py seed_data
```

### Step 4: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **API Docs**: http://localhost:8000/api/

### Step 5: Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (cleans database)
docker-compose down -v
```

---

## Option 2: Manual Setup (Development) 💻

### Part A: Backend Setup

#### 1. Install PostgreSQL and Redis

**Windows:**
- Download PostgreSQL from https://www.postgresql.org/download/windows/
- Download Redis from https://github.com/microsoftarchive/redis/releases

**macOS:**
```bash
brew install postgresql@15 redis
brew services start postgresql@15
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql-15 redis-server
sudo systemctl start postgresql
sudo systemctl start redis
```

#### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mukhattat_db;
CREATE USER mukhattat_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mukhattat_db TO mukhattat_user;
\q
```

#### 3. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and edit environment file
cp .env.example .env
# Edit .env with your database credentials
```

#### 4. Configure .env File

Edit `backend/.env`:

```env
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=mukhattat_db
DB_USER=mukhattat_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
REDIS_URL=redis://localhost:6379/1
```

#### 5. Run Database Migrations

```bash
# Make migrations (if needed)
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load seed data
python manage.py seed_data
```

#### 6. Start Backend Server

```bash
# Start Django development server
python manage.py runserver

# In a NEW terminal, start Celery worker
celery -A mukhattat worker -l info

# In another terminal, start Celery beat (for scheduled tasks)
celery -A mukhattat beat -l info
```

Backend will be running at: **http://localhost:8000**

---

### Part B: Frontend Setup

#### 1. Navigate to Frontend Directory

```bash
# From project root
cd frontend
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Create Environment File

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

#### 4. Start Development Server

```bash
npm run dev
```

Frontend will be running at: **http://localhost:5173**

---

## 🧪 Testing the Setup

### 1. Test Backend API

```bash
# Test API endpoint
curl http://localhost:8000/api/subscriptions/plans/

# Or visit in browser
http://localhost:8000/api/subscriptions/plans/
```

### 2. Test Frontend

1. Open browser: http://localhost:5173
2. You should see the login page
3. Use test credentials:
   - **Username**: `admin`
   - **Password**: `admin123`

### 3. Test Admin Panel

1. Visit: http://localhost:8000/admin
2. Login with superuser credentials
3. You should see all models

---

## 📋 Default Test Users

After running `seed_data`, you can use these accounts:

| Role | Username | Password |
|------|----------|----------|
| Company Admin | `admin` | `admin123` |
| Contractor | `contractor` | `contractor123` |
| Worker 1 | `worker1` | `worker123` |
| Worker 2 | `worker2` | `worker123` |

---

## 🔧 Troubleshooting

### Backend Issues

**Database connection error:**
```bash
# Check PostgreSQL is running
# Windows: Check Services
# macOS: brew services list
# Linux: sudo systemctl status postgresql

# Test connection
psql -U postgres -d mukhattat_db
```

**Migration errors:**
```bash
# Reset migrations (WARNING: deletes data)
python manage.py migrate --run-syncdb
```

**Port already in use:**
```bash
# Change port in settings or kill process
# Windows: netstat -ano | findstr :8000
# macOS/Linux: lsof -i :8000
```

### Frontend Issues

**API connection error:**
- Check `VITE_API_URL` in `.env`
- Ensure backend is running on port 8000
- Check CORS settings in `backend/mukhattat/settings.py`

**Module not found:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Docker Issues

**Services won't start:**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild containers
docker-compose up -d --build
```

**Database connection in Docker:**
- Ensure `DB_HOST=db` in docker-compose environment
- Check if database service is healthy: `docker-compose ps`

---

## 📝 Next Steps

1. **Explore the Dashboard**: Login and check out the dashboard
2. **Create a Project**: Add your first project
3. **Upload Blueprint**: Upload a blueprint image/PDF
4. **Add Pins**: Click on blueprint to add task pins
5. **Create Tasks**: Assign tasks to departments
6. **Track Time**: Log time entries for tasks
7. **Upload Documents**: Test document workflow

---

## 🛠️ Development Commands

### Backend

```bash
# Run tests
python manage.py test

# Create new migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Access Django shell
python manage.py shell

# Collect static files
python manage.py collectstatic
```

### Frontend

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 📚 Additional Resources

- **Django Docs**: https://docs.djangoproject.com/
- **React Docs**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Docker Docs**: https://docs.docker.com/

---

## 💡 Tips

1. **Use Docker for consistency** across different machines
2. **Keep .env files secure** - never commit them to git
3. **Use virtual environments** for Python projects
4. **Check logs** when something doesn't work
5. **Start with seed data** to see the system in action

---

Happy coding! 🎉

