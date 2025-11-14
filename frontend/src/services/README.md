# API Services Documentation

This directory contains all API service functions that connect the React frontend to the Django REST API backend.

## Structure

- `authService.js` - Authentication and user management
- `projectService.js` - Projects and blueprints
- `taskService.js` - Tasks, time entries, and attachments
- `documentService.js` - Document management
- `departmentService.js` - Department management
- `notificationService.js` - Notifications
- `index.js` - Central export file

## Usage

### Direct Service Usage

```javascript
import { getProjects, createProject, uploadBlueprint } from '../services/projectService'

// Get all projects
const projects = await getProjects({ status: 'IN_PROGRESS' })

// Create a project
const newProject = await createProject({
  name: 'New Project',
  description: 'Project description',
  address: '123 Main St',
  status: 'PLANNING'
})

// Upload blueprint
const blueprint = await uploadBlueprint(projectId, file)
```

### Redux Integration

The services are integrated with Redux slices for state management:

```javascript
import { useDispatch, useSelector } from 'react-redux'
import { fetchProjects, createProject } from '../store/slices/projectSlice'

function ProjectsPage() {
  const dispatch = useDispatch()
  const { projects, loading, error } = useSelector(state => state.projects)

  useEffect(() => {
    dispatch(fetchProjects())
  }, [dispatch])

  const handleCreate = async (data) => {
    await dispatch(createProject(data)).unwrap()
    dispatch(fetchProjects()) // Refresh list
  }

  return (
    // Your component JSX
  )
}
```

## Available Services

### Authentication (`authService.js`)
- `login(credentials)` - User login
- `register(userData)` - User registration
- `refreshToken(refreshToken)` - Refresh access token
- `getCurrentUser()` - Get current user profile
- `getUserProfile(userId)` - Get user by ID
- `updateUserProfile(userId, userData)` - Update user
- `changePassword(passwordData)` - Change password
- `getUsers(params)` - Get all users (admin)
- `createUser(userData)` - Create user (admin)
- `deleteUser(userId)` - Delete user (admin)
- `getCompanies(params)` - Get companies
- `createCompany(companyData)` - Create company
- `getContractors(params)` - Get contractors
- `createContractor(contractorData)` - Create contractor

### Projects (`projectService.js`)
- `getProjects(params)` - Get all projects
- `getProject(projectId)` - Get project by ID
- `createProject(projectData)` - Create project
- `updateProject(projectId, projectData)` - Update project
- `deleteProject(projectId)` - Delete project
- `uploadBlueprint(projectId, file)` - Upload blueprint (with validation)
- `deleteBlueprint(projectId)` - Delete blueprint
- `getProjectStatistics(projectId)` - Get project stats
- `getPins(params)` - Get all pins
- `getPin(pinId)` - Get pin by ID
- `createPin(pinData)` - Create pin
- `updatePin(pinId, pinData)` - Update pin
- `deletePin(pinId)` - Delete pin

### Tasks (`taskService.js`)
- `getTasks(params)` - Get all tasks
- `getTask(taskId)` - Get task by ID
- `createTask(taskData)` - Create task
- `updateTask(taskId, taskData)` - Update task
- `deleteTask(taskId)` - Delete task
- `logTime(taskId, timeData)` - Log time entry
- `addComment(taskId, commentData)` - Add comment
- `uploadAttachment(taskId, file)` - Upload attachment (with validation)
- `updateTaskStatus(taskId, status)` - Update task status
- `getMyTasks(params)` - Get current user's tasks
- `getOverdueTasks(params)` - Get overdue tasks
- `getTaskStatistics(params)` - Get task statistics
- `getTimeEntries(params)` - Get time entries
- `getTimeEntry(timeEntryId)` - Get time entry by ID
- `createTimeEntry(timeEntryData)` - Create time entry
- `updateTimeEntry(timeEntryId, timeEntryData)` - Update time entry
- `deleteTimeEntry(timeEntryId)` - Delete time entry

### Documents (`documentService.js`)
- `getDocuments(params)` - Get all documents
- `getDocument(documentId)` - Get document by ID
- `createDocument(documentData)` - Upload document (with validation)
- `updateDocument(documentId, documentData)` - Update document
- `deleteDocument(documentId)` - Delete document
- `approveDocument(documentId, notes)` - Approve document
- `rejectDocument(documentId, notes)` - Reject document
- `requestDocumentModification(documentId, notes)` - Request modification
- `uploadDocumentVersion(documentId, file, changeNotes)` - Upload new version
- `getPendingReviewDocuments(params)` - Get pending reviews
- `getOverdueDocuments(params)` - Get overdue documents

### Departments (`departmentService.js`)
- `getDepartments(params)` - Get all departments
- `getDepartment(departmentId)` - Get department by ID
- `createDepartment(departmentData)` - Create department
- `updateDepartment(departmentId, departmentData)` - Update department
- `deleteDepartment(departmentId)` - Delete department

### Notifications (`notificationService.js`)
- `getNotifications(params)` - Get all notifications
- `getNotification(notificationId)` - Get notification by ID
- `markNotificationAsRead(notificationId)` - Mark as read
- `markAllNotificationsAsRead()` - Mark all as read
- `getUnreadCount()` - Get unread count
- `deleteNotification(notificationId)` - Delete notification

## File Upload Examples

### Upload Blueprint (with validation)
```javascript
import { uploadBlueprint } from '../services/projectService'

const handleUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const blueprint = await uploadBlueprint(projectId, file)
    console.log('Blueprint uploaded:', blueprint)
  } catch (error) {
    console.error('Upload failed:', error.response?.data)
    // Error will show validation messages (file size, MIME type, etc.)
  }
}
```

### Upload Task Attachment
```javascript
import { uploadAttachment } from '../services/taskService'

const handleAttachment = async (file) => {
  try {
    const attachment = await uploadAttachment(taskId, file)
    console.log('Attachment uploaded:', attachment)
  } catch (error) {
    // Handles file size (10MB max) and MIME type validation
  }
}
```

## Error Handling

All services use the axios interceptor in `utils/api.js` which:
- Automatically adds JWT tokens to requests
- Handles token refresh on 401 errors
- Shows error toasts for failed requests
- Redirects to login on authentication failure

## Notes

- All file uploads include backend validation:
  - File size limits (10MB for attachments, 50MB for blueprints)
  - Real MIME type detection (not just extension checking)
  - Image validation using PIL
- Services return the full response data
- Use Redux slices for state management in components
- Services can be used directly for one-off API calls

