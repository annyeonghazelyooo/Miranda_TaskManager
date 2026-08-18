import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('http://127.0.0.1:8000/tasks/')

      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }

      const data = await response.json()
      setTasks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Title is required.')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const response = await fetch('http://127.0.0.1:8000/tasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create task')
      }

      const newTask = await response.json()

      setTasks((currentTasks) => [newTask, ...currentTasks])

      setTitle('')
      setDescription('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (task) => {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditDescription('')
  }

  const handleUpdateTask = async (e, taskId) => {
    e.preventDefault()

    if (!editTitle.trim()) {
      setError('Title is required.')
      return
    }

    try {
      setError('')

      const response = await fetch(
        `http://127.0.0.1:8000/tasks/${taskId}/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: editTitle.trim(),
            description: editDescription.trim(),
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      const updatedTask = await response.json()

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? updatedTask : task
        )
      )

      cancelEdit()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleToggleTask = async (taskId) => {
    try {
      setError('')

      const response = await fetch(
        `http://127.0.0.1:8000/tasks/${taskId}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update task status')
      }

      const updatedTask = await response.json()

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? updatedTask : task
        )
      )
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?'
    )

    if (!confirmed) {
      return
    }

    try {
      setError('')

      const response = await fetch(
        `http://127.0.0.1:8000/tasks/${taskId}/`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      )
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="container">
      <h1>Task Manager</h1>

      <form className="task-form" onSubmit={handleCreateTask}>
        <div className="form-group">
          <label htmlFor="title">Title</label>

          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>

          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description (optional)"
            rows="3"
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Task'}
        </button>
      </form>

      {loading && <p>Loading tasks...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && tasks.length === 0 && (
        <p>No tasks found.</p>
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="task-list">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`task-card ${task.completed ? 'completed' : ''}`}
            >

              {editingId === task.id ? (
                <form
                  className="edit-form"
                  onSubmit={(e) => handleUpdateTask(e, task.id)}
                >
                  <div className="form-group">
                    <label>Title</label>

                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>

                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows="3"
                    />
                  </div>

                  <div className="task-actions">
                    <button type="submit">
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h3>{task.title}</h3>

                  <p>
                    {task.description || 'No description'}
                  </p>

                  <p>
                    Status: {task.completed ? 'Completed' : 'Pending'}
                  </p>
                  <div className="task-actions">
                    <button onClick={() => handleToggleTask(task.id)}>
                      {task.completed ? 'Mark Pending' : 'Mark Completed'}
                    </button>

                    <button onClick={() => startEdit(task)}>
                      Edit
                    </button>

                    <button onClick={() => handleDeleteTask(task.id)}>
                      Delete
                    </button>
                  </div>
                </>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
