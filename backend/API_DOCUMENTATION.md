# API Documentation Guide

The Mukhattat API is fully documented using OpenAPI 3.0 (Swagger) specification.

## Accessing API Documentation

### Swagger UI (Interactive)
- **URL**: http://localhost:8000/api/docs/
- Interactive interface for testing API endpoints
- Browse all available endpoints
- Test requests directly from the browser

### ReDoc (Alternative UI)
- **URL**: http://localhost:8000/api/redoc/
- Clean, readable documentation format
- Better for reading and understanding API structure

### OpenAPI Schema (JSON)
- **URL**: http://localhost:8000/api/schema/
- Raw OpenAPI 3.0 JSON schema
- Can be imported into Postman, Insomnia, etc.

## API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/register/` - User registration
- `POST /api/auth/refresh/` - Refresh JWT token
- `GET /api/auth/me/` - Get current user

### Projects
- `GET /api/projects/` - List projects
- `POST /api/projects/` - Create project
- `GET /api/projects/{id}/` - Get project details
- `PATCH /api/projects/{id}/` - Update project
- `DELETE /api/projects/{id}/` - Delete project
- `POST /api/projects/{id}/upload_blueprint/` - Upload blueprint
- `POST /api/projects/{id}/approve_blueprint/` - Approve blueprint
- `POST /api/projects/{id}/reject_blueprint/` - Reject blueprint

### Tasks
- `GET /api/tasks/` - List tasks
- `POST /api/tasks/` - Create task
- `GET /api/tasks/{id}/` - Get task details
- `PATCH /api/tasks/{id}/` - Update task
- `DELETE /api/tasks/{id}/` - Delete task
- `POST /api/tasks/{id}/log_time/` - Log time entry

### Documents
- `GET /api/documents/` - List documents
- `POST /api/documents/` - Upload document
- `GET /api/documents/{id}/` - Get document details
- `POST /api/documents/{id}/approve/` - Approve document
- `POST /api/documents/{id}/reject/` - Reject document

### Notifications
- `GET /api/notifications/` - List notifications
- `POST /api/notifications/{id}/mark_read/` - Mark notification as read
- `POST /api/notifications/mark_all_read/` - Mark all notifications as read

### Reports
- `GET /api/reports/project_progress/` - Project progress report
- `GET /api/reports/time_tracking/` - Time tracking report
- `GET /api/reports/budget_vs_actual/` - Budget vs actual report
- `GET /api/reports/document_approval_timeline/` - Document approval timeline
- `GET /api/reports/department_performance/` - Department performance report

## Authentication

All API endpoints (except login and register) require JWT authentication.

### Getting a Token

```bash
POST /api/auth/login/
{
  "username": "your_username",
  "password": "your_password"
}
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {...}
}
```

### Using the Token

Include the token in the Authorization header:

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

## Rate Limiting

API endpoints have rate limiting to prevent abuse:

- **Anonymous users**: 100 requests per hour
- **Authenticated users**: 1000 requests per hour
- **Login endpoint**: 5 requests per minute per IP

When rate limit is exceeded, you'll receive a `429 Too Many Requests` response.

## Error Responses

All errors follow a consistent format:

```json
{
  "detail": "Error message here",
  "field_name": ["Field-specific error message"]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Pagination

List endpoints support pagination:

```
GET /api/projects/?page=1&page_size=20
```

Response:
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/projects/?page=2",
  "previous": null,
  "results": [...]
}
```

## Filtering and Searching

Most list endpoints support filtering and searching:

```
GET /api/tasks/?status=COMPLETED&priority=HIGH&search=important
```

## Examples

### Creating a Project

```bash
curl -X POST http://localhost:8000/api/projects/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Project",
    "description": "Project description",
    "status": "PLANNING",
    "company": 1
  }'
```

### Uploading a Blueprint

```bash
curl -X POST http://localhost:8000/api/projects/1/upload_blueprint/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@blueprint.pdf"
```

## Testing with Swagger UI

1. Navigate to http://localhost:8000/api/docs/
2. Click "Authorize" button
3. Enter: `Bearer YOUR_TOKEN`
4. Click "Authorize"
5. Test any endpoint directly from the UI

## Exporting for Postman

1. Visit http://localhost:8000/api/schema/
2. Copy the JSON
3. Import into Postman:
   - File → Import
   - Paste JSON or upload file
   - All endpoints will be imported with proper structure

