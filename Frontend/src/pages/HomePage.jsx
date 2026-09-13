import { useMemo, useState } from 'react'
import Icon from '../components/Icon.jsx'
import TaskCard from '../components/TaskCard.jsx'
import HeroImage from '../components/HeroImage.jsx'
import CinematicFooter from '../components/CinematicFooter.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import { SlotLoader } from '../components/ui/slot-headline.jsx'

export default function HomePage({
  user,
  tasks,
  sampleTasks,
  sampleList,
  setSampleList,
  people,
  loading,
  onOpenAuth,
  onGoToDashboard,
  flash,
  api,
}) {
  const [showAll, setShowAll] = useState(false)
  const [category, setCategory] = useState('All opportunities')
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const homepageTasks = useMemo(() => {
    const existingNames = new Set(tasks.map((t) => t.name?.toLowerCase().trim()))
    const existingIds = new Set(tasks.map((t) => String(t._id || '')))
    const extraSamples = sampleList.filter(
      (s) =>
        !existingIds.has(String(s._id)) &&
        !existingNames.has(s.name?.toLowerCase().trim())
    )
    return [...tasks, ...extraSamples]
  }, [tasks, sampleList])

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase()
    return homepageTasks.filter((task) => {
      const inCategory =
        category === 'All opportunities' ||
        (task.category || []).some(
          (item) => item.toLowerCase() === category.toLowerCase()
        )
      if (!inCategory) return false
      if (!q) return true
      return (
        task.name?.toLowerCase().includes(q) ||
        task.description?.toLowerCase().includes(q) ||
        (task.category || []).some((item) => item.toLowerCase().includes(q))
      )
    })
  }, [category, homepageTasks, query])

  const visibleTasks = useMemo(
    () => (showAll ? filteredTasks : filteredTasks.slice(0, 6)),
    [showAll, filteredTasks]
  )

  const acceptTask = async (task) => {
    if (!user) {
      onOpenAuth('register')
      flash('Welcome! Please sign in or create an account to reserve your volunteer spot. ✨')
      return
    }
    const currentUserId = user._id || user.id
    const isOwner =
      currentUserId &&
      String(task.postedBy?._id || task.postedBy || '') === String(currentUserId)
    if (isOwner) {
      flash('You cannot join your own opportunity! As the organizer, you manage this task. 📋')
      return
    }
    const isSample = !/^[a-f\d]{24}$/i.test(task._id || '')
    if (isSample) {
      setSampleList((items) =>
        items.map((item) =>
          item._id === task._id
            ? { ...item, accepted: [...(item.accepted || []), currentUserId || 'sample-me'] }
            : item
        )
      )
      flash(`🎉 You're in! You joined "${task.name}". Thank you for stepping up to help! ✨`)
      return
    }
    try {
      await api.patch(`/tasks/accept/${task._id}`)
      flash(`🎉 You're in! You joined "${task.name}". The organizer has been notified! ✨`)
    } catch (e) {
      if (e.response?.status === 401) {
        onOpenAuth('login')
        flash('Your session has expired. Please log in again to confirm your spot.')
      } else {
        flash(e.response?.data?.message || 'Could not join this opportunity yet.')
      }
    }
  }

  return (
    <div className="app-shell">
      {/* Nav */}
      <header className="nav container">
        <a className="brand" href="#top">
          <span className="brand-mark">
            <Icon name="spark" size={16} />
          </span>
          goodturn<span className="dot">.</span>
        </a>
        <nav className={mobileOpen ? 'nav-links open' : 'nav-links'}>
          <a href="#discover">Discover</a>
          <a href="#how-it-works">How it works</a>
          <a href="#community">Community</a>
          {user && (
            <button onClick={onGoToDashboard}>Dashboard</button>
          )}
        </nav>
        <div className="nav-actions">
          {user ? (
            <button className="text-button desktop-only" onClick={onGoToDashboard}>
              Open dashboard
            </button>
          ) : (
            <button
              className="text-button desktop-only"
              onClick={() => onOpenAuth('login')}
            >
              Log in
            </button>
          )}
          <button
            className="button button-small"
            onClick={() => onOpenAuth('register')}
          >
            Join Goodturn <Icon name="arrow" size={15} />
          </button>
          <ThemeToggle />
          <button
            className="menu-button"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="hero container">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" /> SMALL ACTIONS. REAL IMPACT.
            </div>
            <h1>
              Do a little good.<br />
              <em>Feel a lot better.</em>
            </h1>
            <p className="hero-lede">
              Find meaningful ways to help in your community — from five-minute
              favours to projects that leave a lasting mark.
            </p>
            <div className="hero-actions">
              <a className="button" href="#discover">
                Find an opportunity <Icon name="arrow" size={17} />
              </a>
              <a className="play-link" href="#how-it-works">
                <span className="play-icon">&gt;</span> See how it works
              </a>
            </div>
            <div className="trust-row">
              <div className="avatar-stack">
                <span className="mini-avatar a1">M</span>
                <span className="mini-avatar a2">A</span>
                <span className="mini-avatar a3">S</span>
                <span className="mini-avatar a4">+</span>
              </div>
              <span>
                <strong>12,400+</strong> people making a difference
              </span>
            </div>

          </div>

          {/* Hero right side: tutoring illustration */}
          <HeroImage />
        </section>

        {/* Ticker */}
        <section className="ticker">
          <div className="ticker-track">
            <div className="ticker-inner">
              <span>MAKE A DIFFERENCE</span><i>*</i>
              <span>MEET YOUR PEOPLE</span><i>*</i>
              <span>START SMALL</span><i>*</i>
              <span>GOOD THINGS HAPPEN</span><i>*</i>
              <span>JOIN THE MOVEMENT</span><i>*</i>
              <span>BE THE CHANGE</span><i>*</i>
              <span>VOLUNTEER TODAY</span><i>*</i>
              <span>GIVE A LITTLE</span><i>*</i>
            </div>
            <div className="ticker-inner" aria-hidden="true">
              <span>MAKE A DIFFERENCE</span><i>*</i>
              <span>MEET YOUR PEOPLE</span><i>*</i>
              <span>START SMALL</span><i>*</i>
              <span>GOOD THINGS HAPPEN</span><i>*</i>
              <span>JOIN THE MOVEMENT</span><i>*</i>
              <span>BE THE CHANGE</span><i>*</i>
              <span>VOLUNTEER TODAY</span><i>*</i>
              <span>GIVE A LITTLE</span><i>*</i>
            </div>
          </div>
        </section>

        {/* Discover / task grid */}
        <section className="discover container" id="discover">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" /> FIND ALL THE TASKS
              </div>
              <h2>
                Find a task that<br />
                <em>fits your good.</em>
              </h2>
            </div>
            <p>
              Browse real community tasks and choose one that matches your time,
              interests, and skills.
            </p>
          </div>
          <div className="filter-row">
            <div className="filter-pills">
              {['All opportunities', 'Community', 'Environment', 'Education'].map(
                (item) => (
                  <button
                    key={item}
                    className={category === item ? 'filter active' : 'filter'}
                    onClick={() => {
                      setCategory(item)
                      setShowAll(false)
                    }}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
            <div className="home-search">
              <Icon name="search" size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search opportunities…"
                aria-label="Search opportunities"
              />
              {query && (
                <button
                  type="button"
                  className="home-search-clear"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="task-grid">
            {loading ? (
              <div className="home-loading">
                <SlotLoader message="Finding your" help="Searching your community" />
              </div>
            ) : (
              visibleTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  user={user}
                  onAccept={acceptTask}
                />
              ))
            )}
          </div>
          {filteredTasks.length > 6 && (
            <button
              className="all-link"
              onClick={() => {
                const next = !showAll
                setShowAll(next)
                flash(
                  next
                    ? `Showing all ${filteredTasks.length} opportunities in your community.`
                    : 'Showing featured opportunities.'
                )
              }}
            >
              {showAll
                ? 'Show fewer opportunities'
                : `View all ${filteredTasks.length} opportunities`}{' '}
              <Icon name="arrow" size={16} />
            </button>
          )}
        </section>

        {/* How it works */}
        <section className="how-section" id="how-it-works">
          <div className="container how-grid">
            <div>
              <div className="eyebrow light">
                <span className="eyebrow-line" /> HOW GOODTURN WORKS
              </div>
              <h2>
                Good is easier<br />
                when you <em>do it together.</em>
              </h2>
              <p>
                There's no perfect way to help. Just your way. Find a small action
                that fits your life, then watch it ripple outwards.
              </p>
              <a href="#discover" className="button button-yellow">
                Start your goodturn <Icon name="arrow" size={16} />
              </a>
            </div>
            <div className="steps">
              <div className="step">
                <span>01</span>
                <div>
                  <h3>Find your thing</h3>
                  <p>
                    Browse opportunities that match your interests, skills and
                    available time.
                  </p>
                </div>
              </div>
              <div className="step">
                <span>02</span>
                <div>
                  <h3>Show up as you are</h3>
                  <p>
                    Connect with people who care about the same things you do.
                  </p>
                </div>
              </div>
              <div className="step">
                <span>03</span>
                <div>
                  <h3>Leave a little light</h3>
                  <p>
                    Every action builds a kinder, more connected community.
                  </p>
                </div>
              </div>
            </div>
            </div>
        </section>

        {/* Community */}
        <section className="community container" id="community">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" /> THE GOODTURN COMMUNITY
              </div>
              <h2>
                People like <em>you.</em>
              </h2>
            </div>
            <p>
              Meet a few of the humans turning small moments into something bigger.
            </p>
          </div>
          <div className="people-grid">
            {people.slice(0, 3).map((person, index) => (
              <article className="person-card" key={person._id || person.id || index}>
                <div
                  className={`person-avatar ${
                    person.color || ['coral', 'blue', 'purple'][index]
                  }`}
                >
                  {person.initials ||
                    person.name?.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3>{person.name || 'Goodturn member'}</h3>
                  <p>
                    {person.role ||
                      person.skills?.join(' - ') ||
                      'Community volunteer'}
                  </p>
                  <span className="rating">
                    {person.rating || 'New'}{' '}
                    <small>impact maker</small>
                  </span>
                </div>
                <span className="person-arrow">→</span>
              </article>
            ))}
          </div>
        </section>

    </main>

    <footer className="footer">
        <div className="container footer-top">
          <a className="brand" href="#top">
            <span className="brand-mark">
              <Icon name="spark" size={16} />
            </span>
            goodturn<span className="dot">.</span>
          </a>
          <div className="footer-links">
            <a href="#discover">Opportunities</a>
            <a href="#community">Community</a>
            <a href="#how-it-works">About</a>
            <a href="#top">Contact</a>
          </div>
          <a href="#top" className="back-top">
            Back to top ^
          </a>
        </div>
        <div className="container footer-bottom">
          <span>© 2025 Goodturn. Small actions, real impact.</span>
          <span>
            Made for the good in all of us <span className="heart">♥</span>
          </span>
        </div>
      </footer>

      <CinematicFooter />
    </div>
  )
}
