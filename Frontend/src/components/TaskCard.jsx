import { useState } from 'react'
import Icon from './Icon.jsx'

export default function TaskCard({ task, onAccept, onComplete, user, allowPreview = false }) {
  const [isJoining, setIsJoining] = useState(false)
  const [justJoined, setJustJoined] = useState(false)
  const [sparkles, setSparkles] = useState([])

  const accepted = (task.accepted?.length || 0) + (justJoined ? 1 : 0)
  const capacity = task.members || 1
  const isPreview = allowPreview && !/^[a-f\d]{24}$/i.test(task._id || '')
  const progress = Math.min(100, Math.round((accepted / capacity) * 100))
  const userId = user?._id || user?.id
  const isOwner = Boolean(
    userId && (String(task.postedBy?._id || task.postedBy || '') === String(userId))
  )
  const mine = justJoined || (userId && task.accepted?.some((id) => String(id?._id || id) === String(userId)))
  const category = task.category?.[0]?.toLowerCase() || 'community'
  const tone = category.includes('environment') ? 'card-1' : category.includes('education') ? 'card-2' : category.includes('support') ? 'card-3' : 'card-0'

  const handleJoin = async (e) => {
    e.stopPropagation()
    if (isJoining || mine || isOwner) return
    setIsJoining(true)

    // Confetti / sparkle coordinates burst
    const burst = [
      { id: 1, x: -28, y: -26, s: 1.2, r: -20 },
      { id: 2, x: 0, y: -36, s: 1, r: 15 },
      { id: 3, x: 28, y: -24, s: 1.1, r: 35 },
      { id: 4, x: -32, y: 12, s: 0.9, r: -40 },
      { id: 5, x: 34, y: 8, s: 1, r: 25 },
      { id: 6, x: -14, y: -42, s: 0.8, r: 10 },
      { id: 7, x: 18, y: -40, s: 1.2, r: -15 },
    ]
    setSparkles(burst)

    try {
      await onAccept?.(task)
      setJustJoined(true)
      setTimeout(() => setSparkles([]), 1200)
    } catch {
      setSparkles([])
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <article className={`task-card ${tone} ${justJoined ? 'task-card-celebrate' : ''}`}>
      <div className="task-top">
        <span className="task-category">{task.category?.[0] || 'Community'}</span>
        <span className="task-time"><Icon name="clock" size={14} /> {task.time || '2 hrs'}</span>
      </div>
      <h3>{task.name}</h3>
      <p>{task.description}</p>
      <div className="task-progress" aria-label={`${progress}% of volunteer spots filled`}>
        <div className="task-progress-label">
          <span>COMMUNITY MOMENTUM</span>
          <strong>{progress}% filled</strong>
        </div>
        <div className="task-progress-track">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="task-footer">
        <span className="spots">
          <Icon name="people" size={15} /> {accepted}/{capacity} filled
        </span>
        {task.status === 'completed' ? (
          <span className="status-pill done">Completed</span>
        ) : isPreview ? (
          <span className="status-pill preview">Preview</span>
        ) : isOwner ? (
          <div className="mine-actions">
            <span className="status-pill owner" title="You organized this opportunity">
              <Icon name="user" size={13} /> Your opportunity
            </span>
            {onComplete && (
              <button type="button" className="small-action" onClick={(e) => { e.stopPropagation(); onComplete?.(task) }}>
                Mark complete
              </button>
            )}
          </div>
        ) : mine ? (
          <div className="mine-actions">
            <span className="joined-badge">
              <Icon name="check" size={14} /> Joined
            </span>
            {onComplete && (
              <button type="button" className="small-action" onClick={(e) => { e.stopPropagation(); onComplete?.(task) }}>
                Mark complete
              </button>
            )}
          </div>
        ) : (
          <div className="join-container">
            {sparkles.map((p) => (
              <span
                key={p.id}
                className="join-sparkle"
                style={{
                  '--x': `${p.x}px`,
                  '--y': `${p.y}px`,
                  '--s': p.s,
                  '--r': `${p.r}deg`,
                }}
              >
                ✨
              </span>
            ))}
            <button
              className={`join-btn ${isJoining ? 'is-joining' : ''}`}
              onClick={handleJoin}
              disabled={isJoining}
              aria-label={`Join ${task.name}`}
            >
              {isJoining ? (
                <>
                  <span className="join-spinner" />
                  <span>Joining...</span>
                </>
              ) : (
                <>
                  <span>Join</span>
                  <span className="circle-arrow-icon">
                    <Icon name="arrow" size={15} />
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
