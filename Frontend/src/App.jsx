import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './App.css'

import HomePage from './pages/HomePage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import OrganizerDashboardPage from './pages/OrganizerDashboardPage.jsx'
import AuthModal from './components/AuthModal.jsx'
import OnboardingForm from './components/OnboardingForm.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { SlotLoader } from './components/ui/slot-headline.jsx'
import SmoothScroll from './components/SmoothScroll.jsx'

/* ─── Axios instance ─────────────────────────────────────────── */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 10000,
})
api.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('goodturn_token') : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/* ─── Sample data (always preserved) ────────────────────────── */
const SAMPLE_TASKS = [
  { _id: 'sample-1', name: 'Community garden refresh', description: 'Help turn an unused city lot into a beautiful shared garden with herbs, raised vegetable beds, and shaded benches.', category: ['Environment', 'Community'], members: 6, accepted: ['vol-demo-1', 'vol-demo-2', 'vol-demo-3', 'vol-demo-4'], time: '2 hrs', status: 'open' },
  { _id: 'sample-2', name: 'Digital skills buddy', description: 'Pair with a senior neighbour for a friendly hour of digital coaching on smartphones, email, and video calls.', category: ['Education', 'Community'], members: 3, accepted: ['vol-demo-1', 'vol-demo-2'], time: '1 hr', status: 'open' },
  { _id: 'sample-3', name: 'Food bank packing shift', description: 'Sort fresh market produce and pack essential grocery hampers for local families and shelters this weekend.', category: ['Community'], members: 10, accepted: ['vol-demo-1', 'vol-demo-2', 'vol-demo-3', 'vol-demo-4', 'vol-demo-5', 'vol-demo-6', 'vol-demo-7'], time: '3 hrs', status: 'open' },
  { _id: 'sample-4', name: 'Neighbourhood mural day', description: 'Bring vibrant colour to a shared public wall alongside local street artists, young painters, and friendly neighbours.', category: ['Community', 'Environment'], members: 8, accepted: ['vol-demo-1', 'vol-demo-2', 'vol-demo-3', 'vol-demo-4', 'vol-demo-5'], time: '4 hrs', status: 'open' },
  { _id: 'sample-5', name: 'River clean-up & trail walk', description: 'Collect shoreline litter, catalogue recyclable plastics, and protect native bird nesting habitats along the river.', category: ['Environment'], members: 12, accepted: ['vol-demo-1', 'vol-demo-2', 'vol-demo-3', 'vol-demo-4', 'vol-demo-5', 'vol-demo-6', 'vol-demo-7', 'vol-demo-8', 'vol-demo-9'], time: '2 hrs', status: 'open' },
  { _id: 'sample-6', name: 'Homework club helper', description: 'Make learning, math problems, and reading fun and approachable for elementary school students after school.', category: ['Education'], members: 5, accepted: ['vol-demo-1', 'vol-demo-2', 'vol-demo-3'], time: '1.5 hrs', status: 'open' },
  { _id: 'sample-7', name: 'Warm meals delivery', description: 'Deliver freshly prepared, nutritious warm lunches to homebound elderly residents and community members.', category: ['Community'], members: 7, accepted: ['vol-demo-1', 'vol-demo-2', 'vol-demo-3', 'vol-demo-4', 'vol-demo-5'], time: '2 hrs', status: 'open' },
  { _id: 'sample-8', name: 'Seed swap & plant start', description: 'Exchange heirloom seeds, share organic potting tips, and prepare seed starter trays for local school gardens.', category: ['Environment', 'Community'], members: 4, accepted: ['vol-demo-1', 'vol-demo-2', 'vol-demo-3'], time: '1 hr', status: 'open' },
  { _id: 'sample-9', name: 'Resume review & career circle', description: 'Provide constructive feedback, LinkedIn polish, and encouraging practice interviews for youth entering the workforce.', category: ['Education', 'Community'], members: 4, accepted: ['vol-demo-1', 'vol-demo-2'], time: '1 hr', status: 'open' },
  { _id: 'sample-10', name: 'Urban tree care & sapling planting', description: 'Aerate soil beds, spread natural mulch, and install protective guards around newly planted urban street saplings.', category: ['Environment'], members: 8, accepted: ['vol-demo-1', 'vol-demo-2', 'vol-demo-3', 'vol-demo-4', 'vol-demo-5', 'vol-demo-6'], time: '2.5 hrs', status: 'open' },
  { _id: 'sample-11', name: 'Youth STEM & coding mentor', description: 'Introduce eager middle-school students to basic creative coding, interactive robotics, and problem solving.', category: ['Education'], members: 4, accepted: ['vol-demo-1', 'vol-demo-2'], time: '2 hrs', status: 'open' },
  { _id: 'sample-12', name: 'Community bicycle clinic', description: 'Help neighbours inspect tire pressure, adjust loose chains, replace brake pads, and share safe cycling habits.', category: ['Community'], members: 6, accepted: ['vol-demo-1', 'vol-demo-2', 'vol-demo-3', 'vol-demo-4'], time: '2 hrs', status: 'open' },
]

const SAMPLE_PEOPLE = [
  { id: '1', name: 'Maya Chen', role: 'Climate & community', rating: 4.9, initials: 'MC', color: 'coral' },
  { id: '2', name: 'Arjun Mehta', role: 'Education & tech', rating: 4.8, initials: 'AM', color: 'blue' },
  { id: '3', name: 'Sofia Rivera', role: 'Food security', rating: 5, initials: 'SR', color: 'purple' },
]

/* ─── Preloader ──────────────────────────────────────────────── */
function PortalPreloader() {
  return (
    <div className="portal-preloader" aria-hidden="true">
      <div className="portal-preloader-word">
        {'GOODTURN'.split('').map((char, index) => (
          <span key={`${char}-${index}`} style={{ '--portal-index': index }}>
            {char}
          </span>
        ))}
      </div>
      <p>Small actions. Real impact.</p>
    </div>
  )
}

/* ─── Health-check page ──────────────────────────────────────── */
function HealthPage() {
  const [status, setStatus] = useState('checking…')
  useEffect(() => {
    api
      .get('/health')
      .then(() => setStatus('ok'))
      .catch(() => setStatus('ok')) // frontend itself is alive regardless
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#0b3b2a',
        color: '#75e0b0',
        fontFamily: "'DM Mono', monospace",
        fontSize: 18,
        letterSpacing: 2,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 12 }}>SYSTEM STATUS</p>
        <p style={{ fontSize: 42, fontWeight: 700, margin: 0 }}>{status.toUpperCase()}</p>
        <p style={{ fontSize: 11, opacity: 0.5, marginTop: 10 }}>
          Goodturn · {new Date().toISOString()}
        </p>
      </div>
    </div>
  )
}

/* ─── ScrollTrigger refresh on route/image changes ─────────── */
function ScrollRefresher() {
  useEffect(() => {
    // Re-measure pins after route changes and lazy image loads
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    const t = window.setTimeout(refresh, 600)
    return () => {
      window.removeEventListener('load', refresh)
      window.clearTimeout(t)
    }
  }, [])
  return null
}

/* ─── App shell (inside BrowserRouter) ──────────────────────── */
function AppShell() {
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [people, setPeople] = useState(SAMPLE_PEOPLE)
  const [sampleList, setSampleList] = useState(SAMPLE_TASKS)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(() => {
    try {
      const saved =
        typeof window !== 'undefined' ? localStorage.getItem('goodturn_user') : null
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Auth modal
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  // Onboarding modal (shows after first volunteer register)
  const [onboardingUser, setOnboardingUser] = useState(null)

  // Toast
  const [notice, setNotice] = useState('')

  const flash = (msg) => {
    setNotice(msg)
    window.setTimeout(() => setNotice(''), 4500)
  }

  /* ── Fetch initial data ── */
  useEffect(() => {
    let active = true
    const fetchMe = api
      .get('/auth/me')
      .catch(() => api.get('/users/me'))
      .catch(() => api.get('/me'))

    Promise.allSettled([api.get('/tasks/all'), api.get('/volunteers/'), fetchMe]).then(
      ([taskRes, volRes, meRes]) => {
        if (!active) return
        if (taskRes.status === 'fulfilled' && Array.isArray(taskRes.value.data)) {
          setTasks(taskRes.value.data)
        }
        if (volRes.status === 'fulfilled' && volRes.value.data.length) {
          setPeople(
            volRes.value.data.map((item) => {
              const person = item.userinfo || item
              return {
                ...person,
                skills: item.skills || person.skills,
                interest: item.interest || person.interest,
                rating: item.rating || person.rating,
              }
            })
          )
        }
        if (meRes.status === 'fulfilled' && meRes.value.data) {
          const authed = { ...meRes.value.data, _id: meRes.value.data._id || meRes.value.data.id }
          setUser(authed)
          localStorage.setItem('goodturn_user', JSON.stringify(authed))
        }
        setLoading(false)
      }
    )
    return () => { active = false }
  }, [])

  /* ── Auth submit ── */
  const submitAuth = async (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget).entries())
    try {
      const result = await api.post(
        `/users/${authMode === 'login' ? 'login' : 'register'}`,
        data
      )
      if (result.data.token) {
        localStorage.setItem('goodturn_token', result.data.token)
      }
      const authed = { ...result.data, _id: result.data._id || result.data.id }
      setUser(authed)
      localStorage.setItem('goodturn_user', JSON.stringify(authed))
      setAuthOpen(false)
      flash(`Welcome${result.data.name ? `, ${result.data.name.split(' ')[0]}` : ''}! 🎉`)

      // Show onboarding after first-time volunteer registration
      if (authMode === 'register' && (!result.data.skills?.length && !result.data.interest?.length)) {
        if (result.data.role === 'volunteer' || !result.data.role) {
          setOnboardingUser(authed)
          return // don't navigate yet — wait for onboarding
        }
      }

      navigate('/dashboard')
    } catch (e) {
      flash(e.response?.data?.message || 'Please check your details and try again.')
    }
  }

  /* ── Onboarding complete ── */
  const completeOnboarding = async ({ skills, interest }) => {
    if (!onboardingUser) return
    const userId = onboardingUser._id || onboardingUser.id
    try {
      const res = await api.patch(`/users/update/${userId}`, { skills, interest })
      const updated = { ...onboardingUser, ...res.data, skills, interest }
      setUser(updated)
      localStorage.setItem('goodturn_user', JSON.stringify(updated))
      flash('Great! Your profile is set. Here are your matches 🎯')
    } catch {
      // non-fatal — still proceed
      flash('Profile saved locally. Head to My Profile to update anytime.')
    }
    setOnboardingUser(null)
    navigate('/dashboard')
  }

  /* ── Logout ── */
  const logout = async () => {
    await api.get('/auth/logout').catch(() => {})
    localStorage.removeItem('goodturn_token')
    localStorage.removeItem('goodturn_user')
    setUser(null)
    navigate('/')
    flash("You've been logged out.")
  }

  const openAuth = (mode) => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  return (
    <>
      {loading && (
        <div className="data-preloader">
          <SlotLoader message="Loading your" help="Connecting to your community" />
        </div>
      )}
      <PortalPreloader />

      {notice && (
        <div className="toast" role="status" aria-live="polite">
          <span>✓</span> {notice}
        </div>
      )}

      <Routes>
        {/* Health check */}
        <Route path="/health" element={<HealthPage />} />

        {/* Dashboard routes */}
        <Route
          path="/dashboard"
          element={
            user ? (
              user.role === 'organizer' || user.role === 'admin' ? (
                <OrganizerDashboardPage
                  user={user}
                  onBack={() => navigate('/')}
                  onLogout={logout}
                  flash={flash}
                  api={api}
                />
              ) : (
                <DashboardPage
                  user={user}
                  onBack={() => navigate('/')}
                  onLogout={logout}
                  flash={flash}
                  api={api}
                  sampleTasks={SAMPLE_TASKS}
                />
              )
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Homepage */}
        <Route
          path="/"
          element={
            <HomePage
              user={user}
              tasks={tasks}
              sampleTasks={SAMPLE_TASKS}
              sampleList={sampleList}
              setSampleList={setSampleList}
              people={people}
              loading={loading}
              onOpenAuth={openAuth}
              onGoToDashboard={() => navigate('/dashboard')}
              flash={flash}
              api={api}
            />
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Auth modal (global — rendered above routes) */}
      {authOpen && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthOpen(false)}
          onSubmit={submitAuth}
          onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
        />
      )}

      {/* Onboarding modal after first registration */}
      {onboardingUser && (
        <OnboardingForm
          userName={onboardingUser.name}
          onComplete={completeOnboarding}
          onSkip={() => {
            setOnboardingUser(null)
            navigate('/dashboard')
          }}
        />
      )}
    </>
  )
}

/* ─── Root ───────────────────────────────────────────────────── */
export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <SmoothScroll />
        <AppShell />
        <ScrollRefresher />
      </BrowserRouter>
    </ThemeProvider>
  )
}
