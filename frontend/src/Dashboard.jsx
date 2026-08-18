import { useEffect, useMemo, useState } from 'react'
import './Dashboard.css'

const API_URL = 'http://127.0.0.1:8000/tasks/'
const LOGS_URL = 'http://127.0.0.1:8000/logs/'

function Icon({ name, size = 18 }) {
  const paths = {
    board: <><rect x="3" y="3" width="7" height="18" rx="2"/><rect x="14" y="3" width="7" height="11" rx="2"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    edit: <path d="m14 5 5 5M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/>,
    trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/></>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    moon: <path d="M20 15.2A8.5 8.5 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z"/>,
    activity: <><path d="M3 12h4l2-7 4 14 2-7h6"/><circle cx="12" cy="12" r="10"/></>,
    chevron: <path d="m7 10 5 5 5-5"/>,
    sparkle: <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z"/><path d="m19 14 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14ZM5 14l.7 1.8 1.8.7-1.8.7L5 19l-.7-1.8-1.8-.7 1.8-.7L5 14Z"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    list: <><path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4.5" cy="6" r=".8" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r=".8" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r=".8" fill="currentColor" stroke="none"/></>,
  }
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

const formatDate = (date) => date ? new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
}).format(new Date(date)) : 'Date unavailable'

const toDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const fromDateKey = (key) => {
  if (!key) return null
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function DateRangePicker({ from, to, onChange }) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => {
    const initial = fromDateKey(from) || new Date()
    return new Date(initial.getFullYear(), initial.getMonth(), 1)
  })
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstWeekday = new Date(year, monthIndex, 1).getDay()
  const cells = Array.from({ length: 42 }, (_, index) => {
    const dayOffset = index - firstWeekday + 1
    return new Date(year, monthIndex, dayOffset)
  })

  const chooseDate = (date) => {
    const key = toDateKey(date)
    if (!from || to || key < from) {
      onChange(key, '')
    } else {
      onChange(from, key)
      setTimeout(() => setOpen(false), 180)
    }
  }

  const label = from
    ? to
      ? `${formatDate(fromDateKey(from))} — ${formatDate(fromDateKey(to))}`
      : `${formatDate(fromDateKey(from))} — Select end date`
    : 'Select date range'

  return <div className="date-picker">
    <button className={`date-trigger ${open ? 'is-open' : ''}`} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
      <Icon name="calendar"/><span><small>Date range</small>{label}</span>
    </button>
    {open && <>
      <button className="calendar-scrim" type="button" aria-label="Close calendar" onClick={() => setOpen(false)}/>
      <div className="calendar-popover">
        <div className="calendar-toolbar">
          <button type="button" onClick={() => setMonth(new Date(year, monthIndex - 1, 1))} aria-label="Previous month">‹</button>
          <select value={monthIndex} onChange={(event) => setMonth(new Date(year, Number(event.target.value), 1))} aria-label="Month">
            {Array.from({ length: 12 }, (_, index) => <option key={index} value={index}>{new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2020, index, 1))}</option>)}
          </select>
          <select value={year} onChange={(event) => setMonth(new Date(Number(event.target.value), monthIndex, 1))} aria-label="Year">
            {Array.from({ length: 9 }, (_, index) => year - 4 + index).map((optionYear) => <option key={optionYear}>{optionYear}</option>)}
          </select>
          <button type="button" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))} aria-label="Next month">›</button>
        </div>
        <div className="calendar-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid">
          {cells.map((date) => {
            const key = toDateKey(date)
            const outside = date.getMonth() !== monthIndex
            const endpoint = key === from || key === to
            const inRange = from && to && key > from && key < to
            return <button key={key} type="button" className={`${outside ? 'outside' : ''} ${endpoint ? 'endpoint' : ''} ${inRange ? 'in-range' : ''}`} onClick={() => chooseDate(date)}>{date.getDate()}</button>
          })}
        </div>
        <div className="calendar-hint">{from && !to ? 'Now select an end date' : 'Choose a start and end date'}</div>
      </div>
    </>}
  </div>
}

function TaskToggle({ checked, disabled, onChange }) {
  return <label className="toggle-wrap">
    <span className="toggle-label">{checked ? 'Done' : 'Pending'}</span>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange}
      aria-label={checked ? 'Mark task as pending' : 'Mark task as complete'} />
    <span className="toggle" aria-hidden="true"><span className="toggle-knob"><Icon name="check" size={13}/></span></span>
  </label>
}

function TaskCard({ task, editing, moving, arriving, onToggle, onEdit, onDelete, onSave, onCancel }) {
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description || '')
  useEffect(() => {
    setEditTitle(task.title)
    setEditDescription(task.description || '')
  }, [task.title, task.description])

  const submit = (event) => {
    event.preventDefault()
    if (editTitle.trim()) onSave(task.id, editTitle.trim(), editDescription.trim())
  }

  return <article className={`task-card ${task.completed ? 'task-card--done' : ''} ${moving ? 'is-moving-out' : ''} ${arriving ? 'is-arriving' : ''}`}>
    {editing ? <form className="edit-form" onSubmit={submit}>
      <label htmlFor={`edit-title-${task.id}`}>Task name</label>
      <input id={`edit-title-${task.id}`} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} autoFocus />
      <label htmlFor={`edit-description-${task.id}`}>Description</label>
      <textarea id={`edit-description-${task.id}`} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows="3" />
      <div className="edit-actions">
        <button className="button button--ghost" type="button" onClick={onCancel}>Cancel</button>
        <button className="button button--primary" type="submit" disabled={!editTitle.trim()}>Save changes</button>
      </div>
    </form> : <>
      <div className="task-card__top">
        <div className={`status-icon ${task.completed ? 'status-icon--done' : ''}`}><Icon name={task.completed ? 'check' : 'clock'} size={17}/></div>
        <div className="task-card__content">
          <h3>{task.title}</h3>
          <p>{task.description || 'No description added.'}</p>
        </div>
        <div className="task-card__actions">
          <button className="icon-button" type="button" onClick={() => onEdit(task.id)} aria-label={`Edit ${task.title}`}><Icon name="edit" size={16}/></button>
          <button className="icon-button icon-button--danger" type="button" onClick={() => onDelete(task.id)} aria-label={`Delete ${task.title}`}><Icon name="trash" size={16}/></button>
        </div>
      </div>
      <div className="task-card__footer">
        <span className="created-date"><Icon name="calendar" size={15}/>Created {formatDate(task.created_at)}</span>
        <TaskToggle checked={task.completed} disabled={moving} onChange={() => onToggle(task)} />
      </div>
    </>}
  </article>
}

function BoardColumn({ type, title, subtitle, tasks, ...props }) {
  return <section className={`board-column board-column--${type}`}>
    <header className="column-header">
      <div className={`column-icon column-icon--${type}`}><Icon name={type === 'completed' ? 'check' : 'clock'}/></div>
      <div>
        <div className="column-title-row"><h2>{title}</h2><span className="task-count">{tasks.length}</span></div>
        <p>{subtitle}</p>
      </div>
    </header>
    <div className="column-body">
      {tasks.length ? tasks.map((task) => <TaskCard key={task.id} task={task} {...props}
        moving={props.movingId === task.id} arriving={props.arrivingId === task.id}
        editing={props.editingId === task.id} />) : <div className="empty-state">
        <div><Icon name={type === 'completed' ? 'check' : 'clock'} size={22}/></div>
        <h3>No {title.toLowerCase()} tasks</h3>
        <p>{type === 'completed' ? 'Completed tasks will appear here.' : 'You are all caught up for now.'}</p>
      </div>}
    </div>
  </section>
}

const activityCopy = (log) => {
  if (log.action === 'CREATE') return <>created <strong>“{log.task_title}”</strong></>
  if (log.action === 'UPDATE') return <>updated <strong>“{log.task_title}”</strong></>
  if (log.action === 'DELETE') return <>deleted <strong>“{log.task_title}”</strong></>
  const completed = log.new_data?.completed
  return <>{completed ? 'completed' : 'moved'} <strong>“{log.task_title}”</strong>{!completed && ' back to Pending'}</>
}

function ActivityChanges({ log }) {
  if (log.action !== 'UPDATE' || !log.old_data || !log.new_data) return null
  const changes = []
  if (log.old_data.title !== log.new_data.title) {
    changes.push({ label: 'Title', oldValue: log.old_data.title, newValue: log.new_data.title })
  }
  if ((log.old_data.description || '') !== (log.new_data.description || '')) {
    changes.push({
      label: 'Description',
      oldValue: log.old_data.description || 'Empty',
      newValue: log.new_data.description || 'Empty',
    })
  }
  if (!changes.length) return null

  return <div className="activity-changes">
    {changes.map((change) => <div className="activity-change" key={change.label}>
      <span>{change.label}</span>
      <del title={change.oldValue}>{change.oldValue}</del>
      <b aria-hidden="true">→</b>
      <ins title={change.newValue}>{change.newValue}</ins>
    </div>)}
  </div>
}

function RecentActivities({ logs, open, onToggle }) {
  const groups = useMemo(() => logs.reduce((result, log) => {
    const date = new Date(log.created_at)
    const key = toDateKey(date)
    if (!result[key]) result[key] = []
    result[key].push(log)
    return result
  }, {}), [logs])

  const groupLabel = (key) => {
    const today = toDateKey(new Date())
    const yesterdayDate = new Date()
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    if (key === today) return 'Today'
    if (key === toDateKey(yesterdayDate)) return 'Yesterday'
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(fromDateKey(key))
  }

  return <section className={`activity-panel ${open ? 'is-expanded' : ''}`}>
    <button className="activity-heading" type="button" onClick={onToggle} aria-expanded={open}>
      <span className="activity-title"><span className="activity-icon"><Icon name="activity"/></span><span><strong>Recent Activities</strong><small>Latest changes across your tasks</small></span></span>
      <span className="activity-heading__end"><span className="activity-count">{logs.length}</span><span className="activity-chevron"><Icon name="chevron" size={18}/></span></span>
    </button>
    {open && <div className="activity-content">
      {logs.length ? Object.entries(groups).map(([key, items]) => <div className="activity-group" key={key}>
        <div className="activity-date"><span/>{groupLabel(key)}<span/></div>
        {items.map((log) => <div className="activity-row" key={log.id}>
          <div className={`activity-avatar activity-avatar--${log.action.toLowerCase()}`}>{log.action === 'STATUS_UPDATE' ? <Icon name="check" size={15}/> : 'TF'}</div>
          <div className="activity-copy"><div><strong>You</strong> {activityCopy(log)}</div><ActivityChanges log={log}/></div>
          <time dateTime={log.created_at}>{new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(log.created_at))}</time>
        </div>)}
      </div>) : <div className="activity-empty"><Icon name="activity" size={24}/><p>No activity recorded yet.</p></div>}
    </div>}
  </section>
}

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [movingId, setMovingId] = useState(null)
  const [arrivingId, setArrivingId] = useState(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [activityOpen, setActivityOpen] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('taskflow-theme') || 'dark')
  const [now, setNow] = useState(() => new Date())
  const [celebration, setCelebration] = useState('')
  const [view, setView] = useState(() => localStorage.getItem('taskflow-view') || 'grid')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('taskflow-theme', theme)
  }, [theme])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    localStorage.setItem('taskflow-view', view)
  }, [view])

  const fetchLogs = async () => {
    try {
      const response = await fetch(LOGS_URL)
      if (response.ok) setLogs(await response.json())
    } catch {
      // Activity is supplementary; task actions remain available if it cannot load.
    }
  }

  const fetchTasks = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Could not load your tasks.')
      setTasks(await response.json())
    } catch (err) {
      setError(`${err.message} Make sure the Django server is running.`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchLogs()
  }, [])

  const filteredTasks = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return tasks.filter((task) => {
      const textMatch = !needle || `${task.title} ${task.description || ''}`.toLowerCase().includes(needle)
      const statusMatch = status === 'all' || (status === 'completed' ? task.completed : !task.completed)
      const created = task.created_at ? toDateKey(new Date(task.created_at)) : ''
      return textMatch && statusMatch && (!dateFrom || created >= dateFrom) && (!dateTo || created <= dateTo)
    })
  }, [tasks, query, status, dateFrom, dateTo])

  const clearFilters = () => {
    setQuery('')
    setStatus('all')
    setDateFrom('')
    setDateTo('')
  }

  const createTask = async (event) => {
    event.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const response = await fetch(API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      })
      if (!response.ok) throw new Error('Could not create the task.')
      const newTask = await response.json()
      setTasks((current) => [newTask, ...current])
      setTitle('')
      setDescription('')
      setShowCreate(false)
      fetchLogs()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const updateTask = async (taskId, newTitle, newDescription) => {
    setError('')
    try {
      const response = await fetch(`${API_URL}${taskId}/`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDescription }),
      })
      if (!response.ok) throw new Error('Could not update the task.')
      const updated = await response.json()
      setTasks((current) => current.map((task) => task.id === taskId ? updated : task))
      setEditingId(null)
      fetchLogs()
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleTask = async (task) => {
    if (movingId) return
    setMovingId(task.id)
    setError('')
    const animation = new Promise((resolve) => setTimeout(resolve, 220))
    try {
      const request = fetch(`${API_URL}${task.id}/`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}',
      })
      const [response] = await Promise.all([request, animation])
      if (!response.ok) throw new Error('Could not change the task status.')
      const updated = await response.json()
      setArrivingId(task.id)
      setTasks((current) => current.map((item) => item.id === task.id ? updated : item))
      setMovingId(null)
      setTimeout(() => setArrivingId(null), 520)
      if (updated.completed) {
        setCelebration(updated.title)
        setTimeout(() => setCelebration(''), 2200)
      }
      fetchLogs()
    } catch (err) {
      setMovingId(null)
      setError(err.message)
    }
  }

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task? This action cannot be undone.')) return
    setError('')
    try {
      const response = await fetch(`${API_URL}${taskId}/`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Could not delete the task.')
      setTasks((current) => current.filter((task) => task.id !== taskId))
      fetchLogs()
    } catch (err) {
      setError(err.message)
    }
  }

  const cardProps = {
    editingId, movingId, arrivingId, onToggle: toggleTask,
    onEdit: setEditingId, onDelete: deleteTask, onSave: updateTask,
    onCancel: () => setEditingId(null),
  }
  const filtersActive = query || status !== 'all' || dateFrom || dateTo
  const pendingCount = tasks.filter((task) => !task.completed).length
  const completedCount = tasks.length - pendingCount
  const completionRate = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0

  return <div className="app-shell">
    <main className="main-content" id="board">
      <header className="page-header">
        <div className="header-brand">
          <div className="logo-shell"><img src="/taskify-logo.svg" alt="Taskify"/></div>
          <div className="header-copy"><span className="eyebrow">Taskify workspace</span><h1>Taskify</h1><p>Organize your tasks, stay on track,
and turn plans into done.</p></div>
        </div>
        <div className="header-actions">
          <div className="live-clock">
            <Icon name="calendar" size={21}/>
            <span><strong>{new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(now)}</strong><small>{new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }).format(now)}</small></span>
          </div>
          <div className="view-toggle" role="group" aria-label="Task layout">
            <button className={view === 'grid' ? 'active' : ''} type="button" onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'}><Icon name="grid" size={16}/></button>
            <button className={view === 'list' ? 'active' : ''} type="button" onClick={() => setView('list')} aria-label="List view" aria-pressed={view === 'list'}><Icon name="list" size={17}/></button>
          </div>
          <button className="theme-toggle" type="button" onClick={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            <span className={theme === 'light' ? 'active' : ''}><Icon name="sun" size={16}/></span>
            <span className={theme === 'dark' ? 'active' : ''}><Icon name="moon" size={16}/></span>
          </button>
          <button className="button button--primary add-button" type="button" onClick={() => setShowCreate(true)}><Icon name="plus"/>Add task</button>
        </div>
      </header>

      <section className="kpi-grid" aria-label="Task overview">
        <article className="kpi-card kpi-card--total"><span className="kpi-icon"><Icon name="board"/></span><span><small>Total tasks</small><strong>{tasks.length}</strong></span></article>
        <article className="kpi-card kpi-card--pending"><span className="kpi-icon"><Icon name="clock"/></span><span><small>Pending</small><strong>{pendingCount}</strong></span></article>
        <article className="kpi-card kpi-card--completed"><span className="kpi-icon"><Icon name="check"/></span><span><small>Completed</small><strong>{completedCount}</strong></span></article>
        <article className="kpi-card kpi-card--rate"><span className="kpi-icon"><Icon name="activity"/></span><span><small>Completion rate</small><strong>{completionRate}%</strong></span><div className="kpi-progress"><i style={{ width: `${completionRate}%` }}/></div></article>
      </section>

      <section className="filters" aria-label="Task filters">
        <div className="search-field"><Icon name="search"/><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks..." aria-label="Search tasks"/></div>
        <div className="select-field"><Icon name="filter"/><select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status"><option value="all">All statuses</option><option value="pending">Pending</option><option value="completed">Completed</option></select></div>
        <DateRangePicker from={dateFrom} to={dateTo} onChange={(from, to) => { setDateFrom(from); setDateTo(to) }}/>
        {filtersActive && <button className="clear-button" type="button" onClick={clearFilters}><Icon name="close" size={15}/>Clear</button>}
      </section>

      {error && <div className="alert" role="alert"><span>{error}</span><button type="button" onClick={fetchTasks}>Retry</button></div>}
      {loading ? <div className="loading-board"><div className="skeleton-column"/><div className="skeleton-column"/></div> : <div className={`board board--${view}`}>
        <BoardColumn type="pending" title="Pending" subtitle="Tasks waiting for your attention" tasks={filteredTasks.filter((task) => !task.completed)} {...cardProps}/>
        <BoardColumn type="completed" title="Completed" subtitle="Finished tasks and recent wins" tasks={filteredTasks.filter((task) => task.completed)} {...cardProps}/>
      </div>}
      <RecentActivities logs={logs} open={activityOpen} onToggle={() => setActivityOpen((value) => !value)}/>
    </main>

    {celebration && <div className="celebration-pop" role="status">
      <span className="celebration-icon"><Icon name="sparkle" size={25}/></span>
      <span><strong>Ang galing mo!</strong><small>“{celebration}” completed</small></span>
      <i className="confetti confetti--one"/><i className="confetti confetti--two"/><i className="confetti confetti--three"/>
    </div>}

    {showCreate && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowCreate(false) }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
        <div className="modal-header"><div><span className="eyebrow">New task</span><h2 id="create-title">What needs to be done?</h2></div><button className="icon-button" type="button" onClick={() => setShowCreate(false)} aria-label="Close"><Icon name="close"/></button></div>
        <form onSubmit={createTask}>
          <label htmlFor="task-title">Task name</label><input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Prepare project handoff" autoFocus/>
          <label htmlFor="task-description">Description <span>Optional</span></label><textarea id="task-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a few details about this task..." rows="4"/>
          <div className="modal-actions"><button className="button button--ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</button><button className="button button--primary" type="submit" disabled={submitting || !title.trim()}>{submitting ? 'Creating...' : 'Create task'}</button></div>
        </form>
      </section>
    </div>}
  </div>
}
