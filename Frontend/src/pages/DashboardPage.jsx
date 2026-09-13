import { useEffect, useState } from 'react'
import Icon from '../components/Icon.jsx'
import TaskCard from '../components/TaskCard.jsx'
import BadgeStrip from '../components/BadgeStrip.jsx'
import VolunteerProfileModal from '../components/VolunteerProfileModal.jsx'
import TaskTracking from '../components/TaskTracking.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import { SlotLoader } from '../components/ui/slot-headline.jsx'
import KineticNavigation from '../components/ui/kinetic-navigation.jsx'

/* ─── Helpers ───────────────────────────────────────────────── */
function Brand() {
  return (
    <a className="brand" href="#top">
      <span className="brand-mark">
        <Icon name="spark" size={16} />
      </span>
      goodturn<span className="dot">.</span>
    </a>
  )
}

function isTaskOwner(task, user) {
  const me = user?._id || user?.id
  return Boolean(me && String(task.postedBy?._id || task.postedBy || '') === String(me))
}

/* ─── TaskList with search bar ─────────────────────────────── */
function TaskList({ title, subtitle, tasks, user, onAccept, onComplete, onTrack, empty }) {
  const [search, setSearch] = useState('')

  const filtered = tasks.filter((task) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      task.name?.toLowerCase().includes(q) ||
      task.description?.toLowerCase().includes(q) ||
      (task.category || []).some((c) => c.toLowerCase().includes(q))
    )
  })

  return (
    <>
      <div className="dash-title-row compact">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-line" /> GOOD OPPORTUNITIES
          </span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="dash-search-bar">
        <span className="dash-search-icon">
          <Icon name="search" size={16} />
        </span>
        <input
          type="search"
          className="dash-search-input"
          placeholder={`Search ${title.toLowerCase()}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={`Search ${title}`}
        />
        {search && (
          <button
            type="button"
            className="dash-search-clear"
            onClick={() => setSearch('')}
            aria-label="Clear search"
          >
            <Icon name="close" size={14} />
          </button>
        )}
      </div>

      {filtered.length ? (
        <div className="task-list-grid">
          {filtered.map((task) => (
            <div key={task._id} className="task-card-wrapper">
              <TaskCard
                task={task}
                user={user}
                onAccept={onAccept}
                onComplete={onComplete}
              />
              {onTrack && (
                <div className="track-actions">
                  {isTaskOwner(task, user) && onComplete && task.status !== 'completed' && (
                    <button
                      type="button"
                      className="track-progress-btn complete"
                      onClick={() => onComplete(task)}
                      title="Mark this task as complete"
                    >
                      <Icon name="check" size={13} /> Complete this
                    </button>
                  )}
                  {isTaskOwner(task, user) && task.status === 'completed' && (
                    <span className="track-progress-btn done">
                      <Icon name="check" size={13} /> Completed
                    </span>
                  )}
                  <button
                    type="button"
                    className="track-progress-btn"
                    onClick={() => onTrack(task)}
                    title="View task progress"
                  >
                    <Icon name="clock" size={13} /> Track progress
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : search ? (
        <div className="empty-state">
          <Icon name="search" size={28} />
          <h2>No results found.</h2>
          <p>Try a different search term or clear the filter.</p>
        </div>
      ) : (
        <div className="empty-state">
          <Icon name="spark" size={28} />
          <h2>Nothing here yet.</h2>
          <p>{empty}</p>
        </div>
      )}
    </>
  )
}

function NotificationList({ items, onRead }) {
  return (
    <>
      <div className="dash-title-row compact">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-line" /> STAY IN THE LOOP
          </span>
          <h1>Your notifications</h1>
          <p>Updates from your Goodturn community.</p>
        </div>
      </div>
      <div className="notification-list">
        {items.length ? (
          items.map((item) => (
            <button
              className={!item.read ? 'notification unread' : 'notification'}
              key={item._id}
              onClick={() => onRead(item)}
            >
              <span className="notification-icon">
                <Icon name="bell" size={17} />
              </span>
              <span>
                <strong>{item.message}</strong>
                <small>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : 'Recently'}
                </small>
              </span>
              {!item.read && <i />}
            </button>
          ))
        ) : (
          <div className="empty-state">
            <Icon name="bell" size={28} />
            <h2>You're all caught up.</h2>
            <p>New updates will appear here.</p>
          </div>
        )}
      </div>
    </>
  )
}

function ProfileForm({ profile, onSubmit }) {
  return (
    <>
      <div className="dash-title-row compact">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-line" /> YOUR DETAILS
          </span>
          <h1>Your profile</h1>
          <p>
            Keep your interests fresh so we can find your best matches.
          </p>
        </div>
      </div>
      <form className="profile-form" onSubmit={onSubmit}>
        <div className="profile-form-avatar">
          {profile.name?.slice(0, 1) || 'G'}
        </div>
        <label>
          Name
          <input name="name" defaultValue={profile.name} required />
        </label>
        <label>
          Email
          <input name="email" type="email" defaultValue={profile.email} required />
        </label>
        <label>
          Interests <small>comma separated</small>
          <input
            name="interest"
            defaultValue={(profile.interest || []).join(', ')}
            placeholder="community, climate, art"
          />
        </label>
        <label>
          Skills <small>comma separated</small>
          <input
            name="skills"
            defaultValue={(profile.skills || []).join(', ')}
            placeholder="design, teaching, gardening"
          />
        </label>
        <button className="button" type="submit">
          Save changes <Icon name="check" size={16} />
        </button>
      </form>
    </>
  )
}

function CreateTask({ onClose, onCreated, api }) {
  const submit = async (event) => {
    event.preventDefault()
    const raw = Object.fromEntries(new FormData(event.currentTarget).entries())
    const data = {
      ...raw,
      category: raw.category.split(',').map((v) => v.trim()).filter(Boolean),
      members: Number(raw.members),
    }
    try {
      await api.post('/tasks/create', data)
      onCreated()
    } catch (e) {
      alert(e.response?.data?.message || 'Could not post opportunity.')
    }
  }
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form className="auth-modal create-modal" onSubmit={submit}>
        <button type="button" className="modal-close" onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
        <div className="eyebrow">
          <span className="eyebrow-line" /> SHARE AN OPPORTUNITY
        </div>
        <h2>Post a little good.</h2>
        <label>
          Opportunity name
          <input name="name" required placeholder="e.g. Park clean-up crew" />
        </label>
        <label>
          Description
          <textarea
            name="description"
            required
            placeholder="What will volunteers help with?"
            className="create-modal-textarea"
          />
        </label>
        <label>
          Category <small>comma separated</small>
          <input name="category" required placeholder="Community, Environment" />
        </label>
        <label>
          People needed
          <input name="members" type="number" min="1" defaultValue="4" required />
        </label>
        <button className="button full" type="submit">
          Post opportunity <Icon name="arrow" size={16} />
        </button>
      </form>
    </div>
  )
}

/* ─── Main Dashboard ────────────────────────────────────────── */
export default function DashboardPage({ user: initialUser, onBack, onLogout, flash, api, sampleTasks }) {
  const [tab, setTab] = useState('overview')
  const [matched, setMatched] = useState([])
  const [mine, setMine] = useState([])
  const [notifications, setNotifications] = useState([])
  const [profile, setProfile] = useState(initialUser)
  const [showCreate, setShowCreate] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [trackingTask, setTrackingTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const userId = initialUser?._id || initialUser?.id

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    Promise.allSettled([
      api.get(`/tasks/matched/${userId}`),
      api.get(`/tasks/mine/${userId}`),
      api.get(`/notifications/user/${userId}`),
    ]).then(([a, b, c]) => {
      if (a.status === 'fulfilled')
        setMatched(a.value.data.map((item) => item.task || item))
      if (b.status === 'fulfilled') setMine(b.value.data)
      if (c.status === 'fulfilled') setNotifications(c.value.data)
      setLoading(false)
    })
  }, [userId, refresh])

  const accept = async (task) => {
    const isOwner =
      userId &&
      String(task.postedBy?._id || task.postedBy || '') === String(userId)
    if (isOwner) {
      flash('You cannot join your own opportunity! As the organizer, you manage this task. 📋')
      return
    }
    const isSample = !/^[a-f\d]{24}$/i.test(task._id || '')
    if (isSample) {
      const updater = (items) =>
        items.map((item) =>
          item._id === task._id
            ? { ...item, accepted: [...(item.accepted || []), userId || 'sample-me'] }
            : item
        )
      setMatched(updater)
      setMine((items) => {
        const exists = items.some((item) => item._id === task._id)
        if (exists) return updater(items)
        return [...items, { ...task, accepted: [...(task.accepted || []), userId || 'sample-me'] }]
      })
      flash(`🎉 Awesome! You joined "${task.name}". Thank you for making a difference!`)
      return
    }
    try {
      await api.patch(`/tasks/accept/${task._id}`)
      flash(`🎉 Fantastic! You joined "${task.name}". You are making an impact!`)
      setRefresh((v) => v + 1)
    } catch (e) {
      if (e.response?.status === 401) {
        flash('Session expired. Please log in again to confirm your spot.')
      } else {
        flash(e.response?.data?.message || 'Could not accept this task.')
      }
    }
  }

  const complete = async (task) => {
    const isSample = !/^[a-f\d]{24}$/i.test(task._id || '')
    if (isSample) {
      const updater = (items) =>
        items.map((t) => (t._id === task._id ? { ...t, status: 'completed' } : t))
      setMine(updater)
      setMatched(updater)
      flash('Nice work! Your contribution has been recorded. 🎉')
      return
    }
    try {
      await api.patch(`/tasks/complete/${task._id}`)
      const updater = (items) =>
        items.map((t) => (t._id === task._id ? { ...t, status: 'completed' } : t))
      setMine(updater)
      setMatched(updater)
      flash('Nice work. Your contribution has been recorded. 🎉')
      setRefresh((v) => v + 1)
    } catch (e) {
      flash(e.response?.data?.message || 'Could not complete this task.')
    }
  }

  const saveProfile = async (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget).entries())
    data.interest = data.interest.split(',').map((v) => v.trim()).filter(Boolean)
    data.skills = data.skills.split(',').map((v) => v.trim()).filter(Boolean)
    try {
      const res = await api.patch(`/users/update/${userId}`, data)
      setProfile(res.data)
      flash('Profile updated.')
      setTab('overview')
    } catch (e) {
      flash(e.response?.data?.message || 'Could not update profile.')
    }
  }

  const markRead = async (item) => {
    try {
      await api.patch(`/notifications/read/${item._id}`)
      setNotifications((items) =>
        items.map((n) => (n._id === item._id ? { ...n, read: true } : n))
      )
    } catch {
      flash('Could not update notification.')
    }
  }

  const firstName = (profile.name || 'friend').split(' ')[0]
  const unreadCount = notifications.filter((n) => !n.read).length

  // Matched tasks: API results + samples (preserve existing sample list)
  const displayMatched = matched.length ? matched : sampleTasks

  return (
    <div className={`dashboard-screen role-${profile.role || 'volunteer'}`}>
      {/* Nav */}
      <header className="dash-nav">
        <div className="dash-nav-inner">
          <Brand />
          <button className="back-link" onClick={onBack}>
            ← Back to explore
          </button>
          <div className="dash-account">
            <button
              className="notification-button"
              onClick={() => setTab('notifications')}
              aria-label="Notifications"
            >
              <Icon name="bell" size={18} />
              {unreadCount > 0 && <i />}
            </button>
            <button
              className="profile-chip"
              onClick={() => setTab('profile')}
            >
              <span>{profile.name?.slice(0, 1) || 'G'}</span>
              {profile.name || 'Your profile'}
            </button>
            <button className="logout-button" onClick={onLogout}>
              <Icon name="logout" size={16} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="dash-layout dash-layout--kinetic">
        {/* Kinetic navigation sidebar (after login) */}
        <KineticNavigation
          userName={profile.name}
          role={profile.role}
          items={[
            ['overview', 'Overview', 'spark'],
            ['matches', 'My matches', 'heart'],
            ['tasks', 'My activity', 'check'],
            ['notifications', 'Notifications', 'bell'],
            ['profile', 'My profile', 'user'],
          ].map(([id, label, icon]) => ({ id, label, icon }))}
          active={tab}
          onSelect={(next) => {
            setTab(next)
            setShowCreate(false)
          }}
          onLogout={onLogout}
          onCreate={profile.role === 'organizer' || profile.role === 'admin' ? () => setShowCreate(true) : null}
          createLabel={profile.role === 'organizer' || profile.role === 'admin' ? 'Post an opportunity' : undefined}
        />

        {/* Main */}
        <main className="dash-main">
          {loading ? (
            <div className="dash-loading">
              <SlotLoader message="Syncing your" help="Pulling your opportunities and activity" />
            </div>
          ) : (
          <>
            {tab === 'overview' && (
            <>
              <div className="dash-title-row">
                <div>
                  <span className="eyebrow">
                    <span className="eyebrow-line" /> YOUR GOODTURN
                  </span>
                  <h1>
                    Make today<br />
                    <em>matter, {firstName}.</em>
                  </h1>
                </div>
                <button className="button" onClick={() => setTab('matches')}>
                  Find an opportunity <Icon name="arrow" size={16} />
                </button>
              </div>
              <div className="stats-row">
                <div>
                  <span>CONTRIBUTIONS</span>
                  <strong>{profile.contributionCount || 0}</strong>
                  <small>tasks completed</small>
                </div>
                <div>
                  <span>IMPACT RATING</span>
                  <strong>
                    {profile.rating || '—'} <i>★</i>
                  </strong>
                  <small>from your community</small>
                </div>
                <div>
                  <span>BADGES EARNED</span>
                  <strong>{profile.badges?.length || 0}</strong>
                  <small>keep going</small>
                </div>
              </div>
              <BadgeStrip badges={profile.badges} />
              <section className="dash-section">
                <div className="dash-section-heading">
                  <div>
                    <span className="eyebrow">
                      <span className="eyebrow-line" /> RECOMMENDED FOR YOU
                    </span>
                    <h2>
                      Feels like <em>your thing.</em>
                    </h2>
                  </div>
                  <button
                    className="plain-link"
                    onClick={() => setTab('matches')}
                  >
                    See all <Icon name="arrow" size={15} />
                  </button>
                </div>
                <div className="task-grid dash-task-grid">
                  {displayMatched.slice(0, 3).map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      user={profile}
                      onAccept={accept}
                      onComplete={complete}
                    />
                  ))}
                </div>
              </section>
              <section className="quote-strip">
                <Icon name="spark" size={22} />
                <div>
                  <p>
                    The best thing I've done this week is something I almost
                    didn't sign up for.
                  </p>
                  <small>— Maya, community volunteer</small>
                </div>
              </section>
            </>
          )}

          {tab === 'matches' && (
            <TaskList
              title="Your matched opportunities"
              subtitle="Based on your interests and skills"
              tasks={displayMatched}
              user={profile}
              onAccept={accept}
              onComplete={complete}
              onTrack={setTrackingTask}
            />
          )}

          {tab === 'tasks' && (
            <TaskList
              title="Your activity"
              subtitle="Tasks you have posted or joined"
              tasks={mine}
              user={profile}
              onAccept={accept}
              onComplete={complete}
              onTrack={setTrackingTask}
              empty="Your activity will show up here once you join an opportunity."
            />
          )}

          {tab === 'notifications' && (
            <NotificationList items={notifications} onRead={markRead} />
          )}

          {tab === 'profile' && (
            <ProfileForm profile={profile} onSubmit={saveProfile} />
          )}
          </>
          )}
        </main>
      </div>

      {showCreate && (
        <CreateTask
          api={api}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            setRefresh((v) => v + 1)
            flash('Opportunity posted!')
          }}
        />
      )}

      {trackingTask && (
        <TaskTracking
          task={trackingTask}
          onClose={() => setTrackingTask(null)}
        />
      )}
    </div>
  )
}
