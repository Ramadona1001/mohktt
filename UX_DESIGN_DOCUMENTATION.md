# Kroki - UX Design Documentation
## Construction & Real Estate Project Management System

---

## 📋 Table of Contents

1. [User Personas](#user-personas)
2. [User Journeys](#user-journeys)
3. [Information Architecture](#information-architecture)
4. [Wireframe Descriptions](#wireframe-descriptions)
5. [Permission Matrix](#permission-matrix)
6. [Navigation Structure](#navigation-structure)
7. [Notifications Map](#notifications-map)
8. [System Workflows](#system-workflows)

---

## 👥 User Personas

### 1. Company Admin (Owner/Client)
**Name:** Sarah Al-Mansouri  
**Age:** 45  
**Role:** Company Owner / Project Owner  
**Goals:**
- Oversee multiple construction projects
- Review and approve contractor submissions
- Track project progress and budgets
- Ensure compliance and quality
- Manage contractors and consultants

**Pain Points:**
- Too many documents to review
- Need quick visibility into project status
- Deadline pressure for approvals
- Communication gaps with contractors

**Tech Savviness:** Medium  
**Device:** Desktop/Laptop primarily

---

### 2. Contractor
**Name:** Ahmed Hassan  
**Age:** 38  
**Role:** General Contractor / Project Manager  
**Goals:**
- Manage multiple projects efficiently
- Coordinate departments (plumbing, electrical, etc.)
- Submit blueprints and documents for approval
- Track task progress and time
- Communicate with owners and consultants

**Pain Points:**
- Waiting for approvals delays work
- Managing multiple departments
- Time tracking accuracy
- Document organization

**Tech Savviness:** Medium-High  
**Device:** Desktop, Tablet, Mobile

---

### 3. Worker (Department Member)
**Name:** Mohammed Ali  
**Age:** 32  
**Role:** Plumber / Electrician / Painter  
**Goals:**
- View assigned tasks
- Log time worked
- Upload photos/documents of work
- See task details and locations on blueprint
- Communicate with team

**Pain Points:**
- Mobile access needed
- Simple interface required
- Quick time logging
- Understanding task locations

**Tech Savviness:** Low-Medium  
**Device:** Mobile phone primarily

---

### 4. Consultant (Engineer/Architect)
**Name:** Dr. Fatima Al-Zahra  
**Age:** 42  
**Role:** Project Consultant / Architect  
**Goals:**
- Review blueprints and technical documents
- Provide expert feedback
- Approve/reject contractor submissions
- Monitor compliance with specifications
- Track review deadlines

**Pain Points:**
- Tight review deadlines
- Need detailed blueprint viewing
- Multiple projects to manage
- Clear communication channels

**Tech Savviness:** High  
**Device:** Desktop with large monitor

---

### 5. Document Controller
**Name:** Layla Ibrahim  
**Age:** 35  
**Role:** Document Controller (Both sides)  
**Goals:**
- Manage document approval workflows
- Ensure documents meet requirements
- Track review deadlines
- Coordinate between parties
- Maintain document versions

**Pain Points:**
- Managing multiple document types
- Deadline tracking
- Version control
- Communication between parties

**Tech Savviness:** Medium-High  
**Device:** Desktop

---

## 🗺️ User Journeys

### Journey 1: Creating a New Project

**Actor:** Company Admin (Sarah)

1. **Entry Point:** Dashboard → "New Project" button
2. **Steps:**
   - Fill project form (name, address, budget, dates)
   - Assign contractor (if available)
   - Set project status (Planning)
   - Save project
3. **Success:** Project created, redirected to project detail page
4. **Next Actions:** Upload blueprint, assign tasks

**Touchpoints:**
- Form validation feedback
- Success notification
- Auto-redirect to project page

---

### Journey 2: Uploading Blueprint & Adding Pins

**Actor:** Contractor (Ahmed)

1. **Entry Point:** Project Detail → "Upload Blueprint" button
2. **Steps:**
   - Select file (PDF/JPG/PNG, max 50MB)
   - File validation (size, type, MIME check)
   - Upload progress indicator
   - Blueprint appears in viewer
3. **Adding Pins:**
   - Click on blueprint to place pin
   - Enter pin label/description
   - Save pin
   - Pin appears on blueprint
4. **Notifications:**
   - Owner and Consultant notified
   - Review timer starts (10 days)
5. **Success:** Blueprint uploaded, pins visible, notifications sent

**Touchpoints:**
- File upload modal
- Blueprint viewer with zoom/pan
- Pin placement interface
- Notification confirmation

---

### Journey 3: Document Approval Workflow

**Actor:** Document Controller (Layla) → Consultant (Fatima)

1. **Trigger:** Contractor uploads document
2. **Notification:** Document Controller receives notification
3. **Review Process:**
   - Open document detail page
   - View document file
   - Check document metadata
   - Review deadline countdown visible
4. **Decision:**
   - **Approve:** Click approve, add notes (optional)
   - **Reject:** Click reject, add rejection reason
   - **Request Modification:** Request changes, add notes
5. **Notifications:**
   - Uploader notified of decision
   - Status updated in system
6. **Timer:** If pending > 10 days, document marked as expired

**Touchpoints:**
- Notification center
- Document detail page
- Approval/rejection buttons
- Countdown timer display
- Status updates

---

### Journey 4: Time Tracking

**Actor:** Worker (Mohammed)

1. **Entry Point:** Task Detail page or "My Tasks"
2. **Steps:**
   - Select task
   - Click "Log Time"
   - Enter hours worked
   - Select date
   - Add notes (optional)
   - Submit
3. **Updates:**
   - Task actual hours updated
   - Time entry appears in log
   - Project statistics updated
4. **Success:** Time logged, confirmation shown

**Touchpoints:**
- Task list/detail page
- Time logging modal
- Time entry history
- Statistics dashboard

---

### Journey 5: Dashboard Usage

**Actor:** Company Admin (Sarah)

1. **Entry Point:** Login → Dashboard
2. **View:**
   - Project statistics (total, in progress, completed)
   - Task overview (pending, in progress, overdue)
   - Recent projects list
   - Pending approvals count
   - Budget overview
3. **Actions:**
   - Click project → Go to project detail
   - Click task → Go to task detail
   - Click notification → View details
4. **Filters:** Filter by status, date range, contractor

**Touchpoints:**
- Dashboard cards
- Quick action buttons
- Filter controls
- Navigation links

---

## 🏗️ Information Architecture

### Site Map

```
Kroki System
│
├── Authentication
│   ├── Login
│   └── Register
│
├── Dashboard (Role-based)
│   ├── Overview Cards
│   ├── Recent Projects
│   ├── Task Summary
│   ├── Pending Approvals
│   └── Budget Overview
│
├── Projects
│   ├── Projects List
│   │   ├── Filter/Search
│   │   ├── Create Project
│   │   └── Project Cards
│   │
│   └── Project Detail
│       ├── Project Info
│       ├── Blueprint Viewer
│       │   ├── Zoom/Pan Controls
│       │   ├── Pin Placement
│       │   └── Pin Management
│       ├── Tasks List
│       ├── Documents List
│       ├── Statistics
│       └── Timeline/Gantt
│
├── Tasks
│   ├── Tasks List
│   │   ├── Filter/Search
│   │   ├── Status Filter
│   │   ├── Create Task
│   │   └── Task Table
│   │
│   └── Task Detail
│       ├── Task Info
│       ├── Time Entries
│       ├── Comments
│       ├── Attachments
│       ├── Blueprint Pin (if linked)
│       └── History
│
├── Documents
│   ├── Documents List
│   │   ├── Filter by Status
│   │   ├── Upload Document
│   │   └── Document Table
│   │
│   └── Document Detail
│       ├── Document Info
│       ├── File Viewer
│       ├── Approval Actions
│       ├── Review Deadline Timer
│       ├── Versions History
│       └── Review Notes
│
├── Reports
│   ├── Project Reports
│   ├── Time Reports
│   ├── Budget Reports
│   ├── Progress Reports
│   └── Export Options
│
├── Departments
│   ├── Departments List
│   └── Department Detail
│
├── Users (Admin)
│   ├── Users List
│   ├── Create User
│   └── User Detail
│
├── Notifications
│   ├── Notifications List
│   ├── Unread Count
│   └── Notification Detail
│
└── Profile
    ├── User Info
    ├── Change Password
    └── Settings
```

---

## 📐 Wireframe Descriptions

### 1. Dashboard (Company Admin View)

**Layout:**
- **Header:** Logo, User menu, Notifications bell, Logout
- **Sidebar:** Navigation menu (Dashboard, Projects, Tasks, Documents, Reports, Profile)
- **Main Content:**
  - **Top Row:** 4 stat cards (Total Projects, Active Projects, Pending Approvals, Budget)
  - **Middle Row:** 2 columns
    - **Left:** Recent Projects (list with status, progress bar)
    - **Right:** Task Overview (pie chart + counts)
  - **Bottom Row:** 
    - **Left:** Pending Documents (table with deadline countdown)
    - **Right:** Recent Activity (timeline)

**Key Elements:**
- Quick action buttons (New Project, Upload Document)
- Filter dropdowns (Date range, Status)
- Clickable cards for navigation

---

### 2. Project Detail Page

**Layout:**
- **Top Section:**
  - Project name, status badge, progress percentage
  - Action buttons (Edit, Upload Blueprint, Add Task)
- **Blueprint Section:**
  - Blueprint viewer (canvas with zoom/pan)
  - Toolbar: Zoom In, Zoom Out, Reset, Pan, Add Pin
  - Pins overlay (clickable markers)
  - Pin list sidebar (if pins exist)
- **Tabs Section:**
  - **Info Tab:** Project details, contractor info, dates, budget
  - **Tasks Tab:** Tasks list with filters, create task button
  - **Documents Tab:** Documents list, upload button
  - **Statistics Tab:** Charts (task completion, time tracking, budget)
  - **Timeline Tab:** Gantt chart view

**Key Elements:**
- Interactive blueprint viewer
- Pin placement interface
- Tab navigation
- Real-time updates

---

### 3. Blueprint Viewer

**Layout:**
- **Canvas Area:** Full blueprint image with zoom/pan capability
- **Toolbar (Top):**
  - Zoom controls (+, -, Reset, Fit to screen)
  - Pan tool toggle
  - Add Pin button
  - Pin list toggle
- **Pin Interaction:**
  - Click on canvas → Place pin
  - Click existing pin → View/edit pin
  - Pin markers with labels
  - Pin detail popup (label, linked task, coordinates)
- **Sidebar (Optional):**
  - Pin list
  - Task links
  - Filter pins by department

**Key Elements:**
- Smooth zoom/pan gestures
- Pin placement accuracy
- Visual feedback
- Mobile-friendly touch controls

---

### 4. Document Approval Page

**Layout:**
- **Header:**
  - Document title, status badge
  - Review deadline countdown (prominent)
  - Uploader info, upload date
- **Main Content:**
  - **Left:** Document file viewer (PDF viewer or image)
  - **Right:** Document info panel
    - Metadata (type, size, version)
    - Review history
    - Approval actions (Approve, Reject, Request Modification)
    - Notes textarea
- **Bottom:**
  - Version history table
  - Comments/notes section

**Key Elements:**
- Countdown timer (red if < 2 days)
- Clear action buttons
- Version comparison
- Review notes display

---

### 5. Task Detail Page

**Layout:**
- **Top Section:**
  - Task title, status, priority badges
  - Assigned to, department, due date
  - Action buttons (Edit, Change Status, Log Time, Add Attachment)
- **Main Content:**
  - **Left Column:**
    - Task description
    - Blueprint pin location (if linked)
    - Time tracking summary
    - Attachments gallery
  - **Right Column:**
    - Comments section (add comment form + list)
    - Time entries log
    - Task history/audit log
- **Bottom:**
  - Related tasks
  - Task dependencies

**Key Elements:**
- Quick status change
- Time logging modal
- Comment threading
- Attachment preview

---

### 6. Reports Page

**Layout:**
- **Filters Section (Top):**
  - Date range picker
  - Project selector
  - Department selector
  - Export buttons (PDF, Excel)
- **Charts Section:**
  - **Row 1:** Project progress chart, Budget vs Actual
  - **Row 2:** Time tracking chart, Task completion chart
  - **Row 3:** Department performance, Document approval timeline
- **Tables Section:**
  - Detailed time entries
  - Task completion report
  - Budget breakdown

**Key Elements:**
- Interactive charts
- Export functionality
- Filter persistence
- Print-friendly layout

---

## 🔐 Permission Matrix

| Feature | Company Admin | Contractor | Worker | Consultant | Document Controller |
|---------|--------------|------------|--------|------------|---------------------|
| **Projects** |
| Create Project | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Projects | ✅ (Own) | ✅ (Assigned) | ✅ (Tasks) | ✅ (Assigned) | ✅ (Assigned) |
| Edit Project | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete Project | ✅ | ❌ | ❌ | ❌ | ❌ |
| Upload Blueprint | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Blueprint | ✅ | ✅ | ✅ (Assigned) | ✅ | ✅ |
| Add/Edit Pins | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Tasks** |
| Create Task | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Tasks | ✅ (All) | ✅ (Projects) | ✅ (Assigned) | ✅ (Projects) | ✅ (Projects) |
| Edit Task | ✅ | ✅ | ✅ (Own) | ❌ | ❌ |
| Delete Task | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign Task | ✅ | ✅ | ❌ | ❌ | ❌ |
| Log Time | ✅ | ✅ | ✅ (Own) | ❌ | ❌ |
| **Documents** |
| Upload Document | ✅ | ✅ | ✅ (Tasks) | ❌ | ❌ |
| View Documents | ✅ (All) | ✅ (Projects) | ✅ (Tasks) | ✅ (Projects) | ✅ (Projects) |
| Approve Document | ✅ | ❌ | ❌ | ✅ | ✅ |
| Reject Document | ✅ | ❌ | ❌ | ✅ | ✅ |
| Request Modification | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Users** |
| Create User | ✅ | ✅ (Workers) | ❌ | ❌ | ❌ |
| View Users | ✅ (Company) | ✅ (Contractor) | ✅ (Department) | ❌ | ❌ |
| Edit Users | ✅ | ✅ (Workers) | ❌ | ❌ | ❌ |
| **Departments** |
| Create Department | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Departments | ✅ | ✅ | ✅ (Own) | ❌ | ❌ |
| **Reports** |
| View Reports | ✅ (All) | ✅ (Own) | ❌ | ✅ (Projects) | ❌ |
| Export Reports | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Notifications** |
| View Notifications | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mark Read | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Blueprint Review** |
| Review Blueprint | ✅ | ❌ | ❌ | ✅ | ❌ |
| Approve Blueprint | ✅ | ❌ | ❌ | ✅ | ❌ |

---

## 🧭 Navigation Structure

### Primary Navigation (Sidebar)

```
📊 Dashboard
📁 Projects
   ├── All Projects
   ├── Active Projects
   └── Completed Projects
✅ Tasks
   ├── All Tasks
   ├── My Tasks
   ├── Overdue Tasks
   └── By Status
📄 Documents
   ├── All Documents
   ├── Pending Review
   ├── Approved
   └── Rejected
👥 Departments (Contractor/Admin)
👤 Users (Admin only)
📊 Reports
🔔 Notifications
⚙️ Profile
```

### Secondary Navigation (Breadcrumbs)

```
Dashboard > Projects > [Project Name] > Tasks
Dashboard > Projects > [Project Name] > Blueprint
Dashboard > Tasks > [Task Name]
Dashboard > Documents > [Document Name]
```

---

## 🔔 Notifications Map

### Notification Types & Triggers

| Notification Type | Trigger | Recipients | Priority |
|------------------|---------|------------|----------|
| **BLUEPRINT_UPLOADED** | Contractor uploads blueprint | Company Admin, Consultant | High |
| **BLUEPRINT_APPROVED** | Blueprint approved | Contractor | Medium |
| **BLUEPRINT_REJECTED** | Blueprint rejected | Contractor | High |
| **TASK_ASSIGNED** | Task assigned to user | Assigned Worker | Medium |
| **TASK_COMPLETED** | Task marked complete | Company Admin, Contractor | Low |
| **TASK_DELAYED** | Task marked delayed | Assigned Worker, Contractor | High |
| **DOCUMENT_UPLOADED** | Document uploaded | Document Controller (opposite side) | High |
| **DOCUMENT_APPROVED** | Document approved | Uploader | Medium |
| **DOCUMENT_REJECTED** | Document rejected | Uploader | High |
| **DOCUMENT_MODIFICATION_REQUESTED** | Modification requested | Uploader | High |
| **DEADLINE_APPROACHING** | Review deadline < 2 days | Document Controller, Consultant | High |
| **DEADLINE_EXPIRED** | Review deadline passed | All parties | Critical |
| **COMMENT_ADDED** | Comment on task | Task assignee, creator | Low |
| **TIME_LOGGED** | Time entry added | Contractor, Company Admin | Low |

### Notification Delivery Channels

- **In-App:** All notification types
- **Email:** High/Critical priority notifications
- **Push (Future):** Mobile app notifications

---

## 🔄 System Workflows

### Workflow 1: Blueprint Review Process

```
1. Contractor uploads blueprint
   ↓
2. System validates file (size, type, MIME)
   ↓
3. Blueprint saved, review timer starts (10 days)
   ↓
4. Notifications sent:
   - Company Admin
   - Consultant (if assigned)
   ↓
5. Review deadline countdown visible
   ↓
6. Consultant/Admin reviews blueprint
   ↓
7. Decision:
   ├─ Approve → Notify Contractor, Timer stops
   ├─ Reject → Notify Contractor, Timer stops
   └─ Request Changes → Notify Contractor, Timer continues
   ↓
8. If deadline expires → Auto-mark as expired, notify all
```

### Workflow 2: Document Approval Workflow

```
1. User uploads document
   ↓
2. System validates file (size, type, MIME)
   ↓
3. Document saved with status: PENDING
   ↓
4. Review deadline set (10 days from upload)
   ↓
5. Notification to Document Controller (opposite side)
   ↓
6. Document Controller reviews
   ↓
7. Decision:
   ├─ Approve → Status: APPROVED, Notify uploader
   ├─ Reject → Status: REJECTED, Notify uploader
   └─ Request Modification → Status: MODIFICATION_REQUESTED, Notify uploader
   ↓
8. If deadline < 2 days → Reminder notification
   ↓
9. If deadline expires → Status: EXPIRED, Notify all
```

### Workflow 3: Task Assignment & Completion

```
1. Contractor/Admin creates task
   ↓
2. Assign to department/user
   ↓
3. Link to blueprint pin (optional)
   ↓
4. Notification to assigned worker
   ↓
5. Worker views task, logs time
   ↓
6. Worker updates status (In Progress → Completed)
   ↓
7. Notifications:
   - Contractor (task completed)
   - Company Admin (if high priority)
   ↓
8. Project statistics updated
```

### Workflow 4: Time Tracking

```
1. Worker opens task detail
   ↓
2. Clicks "Log Time"
   ↓
3. Enters hours, date, notes
   ↓
4. Submits time entry
   ↓
5. System updates:
   - Task actual_hours
   - Project total hours
   - Time entry log
   ↓
6. Statistics recalculated
```

---

## 🎨 Design Principles

### Visual Hierarchy
- **Primary Actions:** Prominent buttons, primary color
- **Secondary Actions:** Outlined buttons, secondary color
- **Information:** Cards, tables, clear typography
- **Alerts:** Color-coded (green=success, red=error, yellow=warning)

### Responsive Design
- **Desktop:** Full feature set, multi-column layouts
- **Tablet:** Simplified navigation, touch-friendly
- **Mobile:** Single column, essential features, bottom navigation

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Clear focus indicators
- Alt text for images

### Performance
- Lazy loading for images
- Pagination for large lists
- Optimistic UI updates
- Caching strategies

---

## 📱 Mobile Considerations

### Essential Mobile Features
- Task list and detail
- Time logging
- Photo upload (attachments)
- Notifications
- Basic blueprint viewing

### Simplified Mobile UI
- Bottom navigation bar
- Swipe gestures
- Large touch targets
- Simplified forms
- Quick actions

---

This UX documentation serves as the foundation for implementing the complete Kroki system with optimal user experience for all roles.

