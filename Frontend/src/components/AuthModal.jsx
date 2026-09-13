import { useRef } from 'react'
import Icon from './Icon.jsx'

const DEMO_ACCOUNTS = [
  {
    label: 'Volunteer demo',
    email: 'maya.demo@goodturn.local',
    password: 'goodturn-demo',
  },
  {
    label: 'Organizer demo',
    email: 'demo.organizer@goodturn.local',
    password: 'goodturn-demo',
  },
]

/**
 * AuthModal – login / register form.
 *
 * The modal-backdrop `onMouseDown` does NOT close the modal — closing is
 * only allowed via the explicit X button. This prevents users from
 * accidentally dismissing the auth gate and joining without logging in.
 *
 * In login mode, one-tap demo buttons prefill the seeded test accounts so
 * you can try the app instantly.
 */
export default function AuthModal({ mode, onClose, onSubmit, onSwitchMode }) {
  const emailRef = useRef(null)
  const passwordRef = useRef(null)

  const useDemo = (account) => {
    if (emailRef.current && passwordRef.current) {
      emailRef.current.value = account.email
      passwordRef.current.value = account.password
      emailRef.current.focus()
    }
  }

  return (
    <div
      className="modal-backdrop"
      /* intentionally no click-outside-to-close on auth modal */
    >
      <form className="auth-modal" onSubmit={onSubmit}>
        <button type="button" className="modal-close" onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
        <div className="eyebrow">
          <span className="eyebrow-line" /> GOOD TO HAVE YOU
        </div>
        <h2>{mode === 'login' ? 'Welcome back.' : 'Join the good.'}</h2>
        <p>
          {mode === 'login'
            ? 'Pick up where you left off.'
            : 'Create an account and find your first goodturn.'}
        </p>
        {mode === 'login' && (
          <div className="demo-login">
            <span>Try a test account:</span>
            {DEMO_ACCOUNTS.map((account) => (
              <button
                type="button"
                key={account.email}
                className="demo-login-chip"
                onClick={() => useDemo(account)}
              >
                <Icon name="spark" size={12} /> {account.label}
              </button>
            ))}
          </div>
        )}
        {mode === 'register' && (
          <>
            <label>
              Name
              <input name="name" required placeholder="Your name" />
            </label>
            <label>
              Join as
              <select name="role" defaultValue="volunteer">
                <option value="volunteer">Volunteer</option>
                <option value="organizer">Organizer</option>
              </select>
            </label>
          </>
        )}
        <label>
          Email
          <input
            ref={emailRef}
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
        </label>
        <label>
          Password
          <input
            ref={passwordRef}
            name="password"
            type="password"
            required
            placeholder="••••••••"
          />
        </label>
        <button className="button full" type="submit">
          {mode === 'login' ? 'Log in' : 'Create account'}{' '}
          <Icon name="arrow" size={16} />
        </button>
        <button
          type="button"
          className="switch-auth"
          onClick={onSwitchMode}
        >
          {mode === 'login'
            ? 'Need an account? Join Goodturn'
            : 'Already a member? Log in'}
        </button>
      </form>
    </div>
  )
}