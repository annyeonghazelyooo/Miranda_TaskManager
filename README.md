# Miranda_TaskManager

A full-stack Task Manager web application built with **Django REST Framework** and **React.js**.

The application allows users to:

- View all tasks
- Create a new task
- Edit an existing task
- Mark a task as completed or pending
- Delete a task
- Record task activity through an audit log

## Tech Stack

### Backend
- Python
- Django
- Django REST Framework
- SQLite
- django-cors-headers

### Frontend
- React.js
- Vite
- JavaScript
- Native Fetch API
- ESLint

## Project Structure

```text
Miranda_TaskManager/
├── backend/
│   ├── config/
│   ├── tasks/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Backend Setup

### 1. Navigate to the backend

```bash
cd backend
```

### 2. Create a virtual environment

#### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

#### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Apply migrations

```bash
python manage.py migrate
```

### 5. Run the Django server

```bash
python manage.py runserver
```

The backend will normally be available at:

```text
http://127.0.0.1:8000/
```

Task API:

```text
http://127.0.0.1:8000/tasks/
```

## Frontend Setup

Open a second terminal.

### 1. Navigate to the frontend

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the Vite development server

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173/
```

## Task Model

Each task contains:

| Field | Description |
|---|---|
| `id` | Unique task identifier |
| `title` | Task title |
| `description` | Optional task description |
| `completed` | Completed or pending status |
| `created_at` | Date and time the task was created |

## API Endpoints

The backend uses Django REST Framework `viewsets.ViewSet`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tasks/` | List all tasks |
| `POST` | `/tasks/` | Create a new task |
| `GET` | `/tasks/{id}/` | Retrieve a task |
| `PUT` | `/tasks/{id}/` | Update title and description |
| `PATCH` | `/tasks/{id}/` | Toggle completed status |
| `DELETE` | `/tasks/{id}/` | Delete a task |

## Example Create Request

```http
POST /tasks/
Content-Type: application/json
```

```json
{
  "title": "Complete assessment",
  "description": "Finish the Task Manager application"
}
```

## Example Update Request

```http
PUT /tasks/1/
Content-Type: application/json
```

```json
{
  "title": "Updated task",
  "description": "Updated description"
}
```

## Toggle Task Status

```http
PATCH /tasks/1/
Content-Type: application/json
```

```json
{}
```

The PATCH endpoint toggles the current `completed` value.

## Audit Log

An additional audit log feature records task changes.

Recorded actions include:

- `CREATE`
- `UPDATE`
- `STATUS_UPDATE`
- `DELETE`

The audit log stores the task ID, task title, action type, previous data, updated data, and timestamp.

## CORS

The frontend and backend run on different development origins.

Typical development origins:

```text
Frontend: http://localhost:5173
Backend:  http://127.0.0.1:8000
```

The backend uses `django-cors-headers` so the React frontend can communicate with Django during development.

## Testing

Verify the following from the React UI:

1. Create a task.
2. Confirm it appears in the task list.
3. Edit the task title and description.
4. Toggle the task between pending and completed.
5. Delete the task.
6. Verify loading and error states.
7. Confirm audit log entries are created for task changes.

## Notes and Assumptions

- SQLite is used as the database.
- Django REST Framework uses `viewsets.ViewSet`, not `ModelViewSet`.
- PUT updates the task title and description.
- PATCH toggles the completed status only.
- Task descriptions are optional.
- New tasks default to `completed = false`.
- Authentication is outside the scope of this project.
- Audit logging is an additional feature beyond the core Task Manager requirements.

## Running the Complete Application

Use two terminals.

### Terminal 1 — Backend

```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173/
```
