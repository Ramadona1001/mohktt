# Mukhattat - Real Estate Project Management Platform

**Mukhattat** (مخطط) is a comprehensive full-stack web platform for real estate project management with detailed task tracking on project blueprints.

## 🏗️ Features

- **User & Role Management**: Company Admin, Contractor, Worker, and Document Controller roles
- **Project Management**: Create and manage construction projects with blueprint uploads
- **Task Management**: Add pins to blueprints, assign tasks to departments, track progress
- **Time Tracking**: Track estimated vs actual hours for tasks
- **Document Management**: Upload, review, and approve project documents with timer-based workflow
- **Notifications**: Real-time in-app and email notifications
- **Reporting Dashboard**: Comprehensive reports and analytics
- **Subscription Plans**: Free and Pro plans with feature limitations

## 🧩 Tech Stack

### Backend
- Django 4.2.7
- Django REST Framework
- PostgreSQL
- Celery (async tasks)
- Redis (caching & message broker)
- JWT Authentication
- Channels (WebSocket)

### Frontend
- React 18
- Vite
- Tailwind CSS
- Redux Toolkit
- React Query
- React Konva (blueprint visualization)
- Recharts (charts)

## 📋 Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

## 🚀 Quick Start

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd mukhattat
```

2. Copy environment file:
```bash
cp backend/.env.example backend/.env
```

3. Start services:
```bash
docker-compose up -d
```

4. Run migrations:
```bash
docker-compose exec backend python manage.py migrate
```

5. Create superuser:
```bash
docker-compose exec backend python manage.py createsuperuser
```

6. Load seed data:
```bash
docker-compose exec backend python manage.py shell < backend/seed_data.py
```

7. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

### Manual Setup

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Create superuser:
```bash
python manage.py createsuperuser
```

7. Load seed data:
```bash
python manage.py shell < seed_data.py
```

8. Start development server:
```bash
python manage.py runserver
```

9. Start Celery worker (in a separate terminal):
```bash
celery -A mukhattat worker -l info
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:8000/api
```

4. Start development server:
```bash
npm run dev
```

## 👥 Default Users (from seed data)

- **Company Admin**: username=`admin`, password=`admin123`
- **Contractor**: username=`contractor`, password=`contractor123`
- **Worker 1**: username=`worker1`, password=`worker123`
- **Worker 2**: username=`worker2`, password=`worker123`

## 📁 Project Structure

```
mukhattat/
├── backend/
│   ├── accounts/          # User, Company, Contractor models
│   ├── projects/          # Project, Blueprint, Pin models
│   ├── tasks/             # Task, TimeEntry, Comments models
│   ├── departments/        # Department model
│   ├── documents/          # Document management
│   ├── notifications/      # Notifications & WebSocket
│   ├── subscriptions/      # Subscription plans
│   └── mukhattat/         # Django settings
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store & slices
│   │   └── utils/          # Utilities & API client
│   └── public/
└── docker-compose.yml
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/login/` - Login
- `POST /api/auth/register/register/` - Register
- `POST /api/auth/refresh/` - Refresh token

### Projects
- `GET /api/projects/` - List projects
- `POST /api/projects/` - Create project
- `GET /api/projects/{id}/` - Get project details
- `POST /api/projects/{id}/upload_blueprint/` - Upload blueprint
- `GET /api/projects/pins/` - List pins

### Tasks
- `GET /api/tasks/` - List tasks
- `POST /api/tasks/` - Create task
- `GET /api/tasks/{id}/` - Get task details
- `POST /api/tasks/{id}/log_time/` - Log time
- `GET /api/tasks/statistics/` - Get statistics

### Documents
- `GET /api/documents/` - List documents
- `POST /api/documents/` - Upload document
- `POST /api/documents/{id}/approve/` - Approve document
- `POST /api/documents/{id}/reject/` - Reject document

### Notifications
- `GET /api/notifications/` - List notifications
- `POST /api/notifications/{id}/mark_read/` - Mark as read

## 🧪 Testing

Run backend tests:
```bash
cd backend
python manage.py test
```

## 📝 Environment Variables

See `backend/.env.example` for all available environment variables.

Key variables:
- `SECRET_KEY`: Django secret key
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Database credentials
- `CELERY_BROKER_URL`: Redis URL for Celery
- `EMAIL_HOST`, `EMAIL_PORT`: Email configuration
- `DOCUMENT_REVIEW_TIMER_DAYS`: Document review deadline (default: 10 days)

## 🚢 Deployment

### Production Checklist

1. Set `DEBUG=False` in settings
2. Configure proper `ALLOWED_HOSTS`
3. Set up proper database (PostgreSQL)
4. Configure static files serving (WhiteNoise or S3)
5. Set up SSL/HTTPS
6. Configure email backend
7. Set up Celery workers and beat scheduler
8. Configure Redis for caching and channels

## 📄 License

This project is proprietary software.

## 🤝 Contributing

This is a private project. For contributions, please contact the project maintainers.

## 📧 Support

For support, email support@mukhattat.com or create an issue in the repository.

---

Built with ❤️ for construction project management

