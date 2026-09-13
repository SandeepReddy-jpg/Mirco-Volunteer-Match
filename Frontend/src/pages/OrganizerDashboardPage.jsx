import { useEffect, useState } from 'react'
import Icon from '../components/Icon.jsx'
import TaskCard from '../components/TaskCard.jsx'
import VolunteerProfileModal from '../components/VolunteerProfileModal.jsx'
import TaskTracking from '../components/TaskTracking.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import { SlotLoader } from '../components/ui/slot-headline.jsx'
import KineticNavigation from '../components/ui/kinetic-navigation.jsx'

const samplePeople = [
  { id: '1', name: 'Maya Chen', role: 'Climate & community', rating: 4.9, initials: 'MC', color: 'coral' },
  { id: '2', name: 'Arjun Mehta', role: 'Education & tech', rating: 4.8, initials: 'AM', color: 'blue' },
  { id: '3', name: 'Sofia Rivera', role: 'Food security', rating: 5, initials: 'SR', color: 'purple' },
]

function Brand() {
  return (
    <a className="brand" href="#top">
      <span className="brand-mark"><Icon name="spark" size={16} /></span>
      goodturn<span className="dot">.</span>
    </a>
  )
}

function isTaskOwner(task, user) {
  const me = user?._id || user?.id
  return Boolean(me && String(task.postedBy?._id || task.postedBy || '') === String(me))
}

function TaskListSimple({ title, subtitle, tasks, user, onAccept, onComplete, onTrack, onOpenCreate }) {
  return (
    <>
      <div className="dash-title-row compact">
        <div>
          <span className="eyebrow"><span className="eyebrow-line" /> GOOD OPPORTUNITIES</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      {tasks.length ? (
        <div className="task-list-grid">
          {tasks.map((task) => (
            <div key={task._id} className="task-card-wrapper">
              <TaskCard task={task} user={user} onAccept={onAccept} onComplete={onComplete} />
              <div className="track-actions">
                {isTaskOwner(task, user) && onComplete && task.status !== 'completed' && (
                  <button type="button" className="track-progress-btn complete" onClick={() => onComplete(task)}>
                    <Icon name="check" size={13} /> Complete this
                  </button>
                )}
                {isTaskOwner(task, user) && task.status === 'completed' && (
                  <span className="track-progress-btn done">
                    <Icon name="check" size={13} /> Completed
                  </span>
                )}
                {onTrack && (
                  <button type="button" className="track-progress-btn" onClick={() => onTrack(task)}>
                    <Icon name="clock" size={13} /> Track progress
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state organizer-empty">
          <Icon name="plus" size={28} />
          <h2>Your first opportunity starts here.</h2>
          <p>Publish a small action and invite your community to join.</p>
          {onOpenCreate && (
            <button className="button organizer-primary" onClick={onOpenCreate}>
              Create opportunity
            </button>
          )}
        </div>
      )}
    </>
  )
}

function VolunteerDirectory({ volunteers, onViewProfile }) {
  const visible = volunteers.length
    ? volunteers
    : samplePeople.map((p) => ({ userinfo: p, skills: [p.role], rating: p.rating }))

  return (
    <>
      <div className="dash-title-row compact">
        <div>
          <span className="eyebrow"><span className="eyebrow-line" /> YOUR COMMUNITY</span>
          <h1>Volunteer directory</h1>
          <p>People who are ready to bring time, skills, and care to the work.</p>
        </div>
      </div>
      <div className="organizer-volunteer-grid">
        {visible.map((item, i) => {
          const person = item.userinfo || item
          return (
            <article className="organizer-volunteer" key={item._id || person._id || person.id || i}>
              <div className="organizer-person-avatar">{person.name?.slice(0, 1) || '?'}</div>
              <div>
                <h3>{person.name || 'Community volunteer'}</h3>
                <p>{item.skills?.join(' · ') || person.role || 'Open to new opportunities'}</p>
                <span>★ {person.rating || item.rating || 'New'} rating</span>
              </div>
              <button type="button" className="volunteer-view-button" onClick={() => onViewProfile?.(item)}>
                View profile
              </button>
            </article>
          )
        })}
      </div>
    </>
  )
}

function NotificationList({ items, onRead }) {
  return (
    <>
      <div className="dash-title-row compact">
        <div>
          <span className="eyebrow"><span className="eyebrow-line" /> INBOX</span>
          <h1>Your notifications</h1>
          <p>Updates from your Goodturn community.</p>
        </div>
      </div>
      <div className="notification-list">
        {items.length ? (
          items.map((item) => (
            <button className={!item.read ? 'notification unread' : 'notification'} key={item._id} onClick={() => onRead(item)}>
              <span className="notification-icon"><Icon name="bell" size={17} /></span>
              <span>
                <strong>{item.message}</strong>
                <small>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}</small>
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
          <span className="eyebrow"><span className="eyebrow-line" /> YOUR DETAILS</span>
          <h1>Your profile</h1>
          <p>Keep your interests fresh so we can find your best matches.</p>
        </div>
      </div>
      <form className="profile-form" onSubmit={onSubmit}>
        <div className="profile-form-avatar">{profile.name?.slice(0, 1) || 'O'}</div>
        <label>Name<input name="name" defaultValue={profile.name} required /></label>
        <label>Email<input name="email" type="email" defaultValue={profile.email} required /></label>
        <label>Interests <small>comma separated</small><input name="interest" defaultValue={(profile.interest || []).join(', ')} placeholder="community, climate, art" /></label>
        <label>Skills <small>comma separated</small><input name="skills" defaultValue={(profile.skills || []).join(', ')} placeholder="design, teaching, gardening" /></label>
        <button className="button" type="submit">Save changes <Icon name="check" size={16} /></button>
      </form>
    </>
  )
}

function CreateTask({ onClose, onCreated, api }) {
  const submit = async (event) => {
    event.preventDefault()
    const raw = Object.fromEntries(new FormData(event.currentTarget).entries())
    const data = { ...raw, category: raw.category.split(',').map((v) => v.trim()).filter(Boolean), members: Number(raw.members) }
    try { await api.post('/tasks/create', data); onCreated() }
    catch (e) { alert(e.response?.data?.message || 'Could not post opportunity.') }
  }
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="auth-modal create-modal" onSubmit={submit}>
        <button type="button" className="modal-close" onClick={onClose}><Icon name="close" size={18} /></button>
        <div className="eyebrow"><span className="eyebrow-line" /> SHARE AN OPPORTUNITY</div>
        <h2>Post a little good.</h2>
        <label>Opportunity name<input name="name" required placeholder="e.g. Park clean-up crew" /></label>
        <label>Description<textarea name="description" required placeholder="What will volunteers help with?" className="create-modal-textarea" /></label>
        <label>Category <small>comma separated</small><input name="category" required placeholder="Community, Environment" /></label>
        <label>People needed<input name="members" type="number" min="1" defaultValue="4" required /></label>
        <button className="button full" type="submit">Post opportunity <Icon name="arrow" size={16} /></button>
      </form>
    </div>
  )
}

export default function OrganizerDashboardPage({ user: initialUser, onBack, onLogout, flash, api }) {
  const [tab, setTab] = useState('overview')
  const [tasks, setTasks] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [notifications, setNotifications] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [selectedVolunteer, setSelectedVolunteer] = useState(null)
  const [profile, setProfile] = useState(initialUser)
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
      api.get(`/tasks/mine/${userId}`),
      api.get('/volunteers/'),
      api.get(`/notifications/user/${userId}`),
    ]).then(([taskRes, volRes, notifRes]) => {
      if (taskRes.status === 'fulfilled') setTasks(taskRes.value.data)
      if (volRes.status === 'fulfilled') setVolunteers(volRes.value.data)
      if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data)
      setLoading(false)
    })
  }, [userId, refresh])

  const markRead = async (item) => {
    try {
      await api.patch(`/notifications/read/${item._id}`)
      setNotifications((items) => items.map((n) => n._id === item._id ? { ...n, read: true } : n))
    } catch { flash('Could not update notification.') }
  }

  const complete = async (task) => {
    const isSample = !/^[a-f\d]{24}$/i.test(task._id || '')
    if (isSample) {
      setTasks((items) => items.map((t) => t._id === task._id ? { ...t, status: 'completed' } : t))
      flash('Opportunity marked complete! 🎉')
      return
    }
    try {
      await api.patch(`/tasks/complete/${task._id}`)
      setTasks((items) => items.map((t) => t._id === task._id ? { ...t, status: 'completed' } : t))
      flash('Opportunity marked complete! 🎉')
      setRefresh((v) => v + 1)
    } catch (e) {
      flash(e.response?.data?.message || 'Could not complete opportunity.')
    }
  }

  const unread = notifications.filter((n) => !n.read).length
  const active = tasks.filter((t) => t.status === 'open' || t.status === 'accepted').length
  const filled = tasks.reduce((total, t) => total + (t.accepted?.length || 0), 0)

  const nav = [
    ['overview', 'Operations home', 'spark'],
    ['opportunities', 'My opportunities', 'check'],
    ['volunteers', 'Volunteer directory', 'people'],
    ['notifications', 'Inbox', 'bell'],
    ['profile', 'Organization profile', 'user'],
  ]

  return (
    <div className="dashboard-screen role-organizer">
      <header className="dash-nav">
        <div className="dash-nav-inner">
          <Brand />
          <button className="back-link" onClick={onBack}>← Back to explore</button>
          <div className="dash-account">
            <button className="notification-button" onClick={() => setTab('notifications')}>
              <Icon name="bell" size={18} />{unread > 0 && <i />}
            </button>
            <button className="profile-chip" onClick={() => setTab('profile')}>
              <span>{profile.name?.slice(0, 1) || 'O'}</span>{profile.name || 'Organization'}
            </button>
            <button className="logout-button" onClick={onLogout}><Icon name="logout" size={16} /></button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="dash-layout dash-layout--kinetic">
        {/* Kinetic navigation sidebar (after login) */}
        <KineticNavigation
          userName={profile.name}
          role={profile.role || 'organizer'}
          items={nav.map(([id, label, icon]) => ({ id, label, icon }))}
          active={tab}
          onSelect={setTab}
          onLogout={onLogout}
          onCreate={() => setShowCreate(true)}
          createLabel="Create opportunity"
        />

        <main className="dash-main organizer-main">
          {loading ? (
            <div className="dash-loading">
              <SlotLoader message="Syncing your" help="Pulling your opportunities and community" />
            </div>
          ) : (
          <>
            {tab === 'overview' && (
            <>
              <div className="dash-title-row">
                <div>
                  <span className="eyebrow"><span className="eyebrow-line" /> ORGANIZER OPERATIONS</span>
                  <h1>Make impact<br /><em>move, together.</em></h1>
                  <p>Publish opportunities, see who is showing up, and keep every community effort on track.</p>
                </div>
                <button className="button organizer-primary" onClick={() => setShowCreate(true)}>
                  <Icon name="plus" size={16} /> Create opportunity
                </button>
              </div>
              <div className="stats-row">
                <div><span>ACTIVE OPPORTUNITIES</span><strong>{active}</strong><small>currently open or accepted</small></div>
                <div><span>VOLUNTEER SIGN-UPS</span><strong>{filled}</strong><small>people joining your work</small></div>
                <div><span>COMPLETED PROJECTS</span><strong>{tasks.filter((t) => t.status === 'completed').length}</strong><small>impact delivered</small></div>
              </div>
              <section className="dash-section">
                <div className="dash-section-heading">
                  <div>
                    <span className="eyebrow"><span className="eyebrow-line" /> PUBLISHED WORK</span>
                    <h2>Keep good things <em>moving.</em></h2>
                  </div>
                  <button className="plain-link" onClick={() => setTab('opportunities')}>Manage all <Icon name="arrow" size={15} /></button>
                </div>
                <div className="task-grid dash-task-grid">
                  {tasks.length ? (
                    tasks.slice(0, 3).map((task) => (
                      <div key={task._id} className="task-card-wrapper">
                        <TaskCard task={task} user={profile} onComplete={complete} onAccept={() => {}} />
                        <div className="track-actions">
                          {isTaskOwner(task, profile) && task.status !== 'completed' && (
                            <button type="button" className="track-progress-btn complete" onClick={() => complete(task)}>
                              <Icon name="check" size={13} /> Complete this
                            </button>
                          )}
                          {isTaskOwner(task, profile) && task.status === 'completed' && (
                            <span className="track-progress-btn done">
                              <Icon name="check" size={13} /> Completed
                            </span>
                          )}
                          <button type="button" className="track-progress-btn" onClick={() => setTrackingTask(task)}>
                            <Icon name="clock" size={13} /> Track progress
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state organizer-empty">
                      <Icon name="plus" size={28} />
                      <h2>Your first opportunity starts here.</h2>
                      <p>Publish a small action and invite your community to join.</p>
                      <button className="button organizer-primary" onClick={() => setShowCreate(true)}>Create opportunity</button>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {tab === 'opportunities' && (
            <TaskListSimple
              title="My opportunities"
              subtitle="Publish, monitor, and complete your community work."
              tasks={tasks}
              user={profile}
              onAccept={() => {}}
              onComplete={complete}
              onTrack={setTrackingTask}
              onOpenCreate={() => setShowCreate(true)}
            />
          )}

          {tab === 'volunteers' && (
            <VolunteerDirectory volunteers={volunteers} onViewProfile={setSelectedVolunteer} />
          )}

          {tab === 'notifications' && (
            <NotificationList items={notifications} onRead={markRead} />
          )}

          {tab === 'profile' && (
            <ProfileForm
              profile={profile}
              onSubmit={async (event) => {
                event.preventDefault()
                const data = Object.fromEntries(new FormData(event.currentTarget).entries())
                data.interest = data.interest.split(',').map((v) => v.trim()).filter(Boolean)
                data.skills = data.skills.split(',').map((v) => v.trim()).filter(Boolean)
                try {
                  const res = await api.patch(`/users/update/${userId}`, data)
                  setProfile(res.data)
                  flash('Organization profile updated.')
                  setTab('overview')
                } catch (e) {
                  flash(e.response?.data?.message || 'Could not update profile.')
                }
              }}
            />
          )}
          </>
          )}
        </main>
      </div>

      {showCreate && (
        <CreateTask
          api={api}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); setRefresh((v) => v + 1); flash('Opportunity published.') }}
        />
      )}

      {selectedVolunteer && (
        <VolunteerProfileModal volunteer={selectedVolunteer} onClose={() => setSelectedVolunteer(null)} />
      )}

      {trackingTask && (
        <TaskTracking task={trackingTask} onClose={() => setTrackingTask(null)} />
      )}
    </div>
  )
}
