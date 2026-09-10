import Icon from './Icon.jsx'

export default function TaskCard({ task, onAccept, onComplete, user, allowPreview = false }) {
  const accepted = task.accepted?.length || 0
  const capacity = task.members || 1
  const isPreview = allowPreview && !/^[a-f\d]{24}$/i.test(task._id || '')
  const progress = Math.min(100, Math.round((accepted / capacity) * 100))
  const userId = user?._id || user?.id
  const mine = userId && task.accepted?.some((id) => String(id?._id || id) === String(userId))
  const category = task.category?.[0]?.toLowerCase() || 'community'
  const tone = category.includes('environment') ? 'card-1' : category.includes('education') ? 'card-2' : category.includes('support') ? 'card-3' : 'card-0'

  return <article className={`task-card ${tone}`}>
    <div className="task-top"><span className="task-category">{task.category?.[0] || 'Community'}</span><span className="task-time"><Icon name="clock" size={14} /> {task.time || '2 hrs'}</span></div>
    <h3>{task.name}</h3>
    <p>{task.description}</p>
    <div className="task-progress" aria-label={`${progress}% of volunteer spots filled`}>
      <div className="task-progress-label"><span>COMMUNITY MOMENTUM</span><strong>{progress}% filled</strong></div>
      <div className="task-progress-track"><span style={{ width: `${progress}%` }} /></div>
    </div>
    <div className="task-footer"><span className="spots"><Icon name="people" size={15} /> {accepted}/{capacity} filled</span>{task.status === 'completed' ? <span className="status-pill done">Completed</span> : isPreview ? <span className="status-pill preview">Preview</span> : mine ? <button className="small-action" onClick={() => onComplete(task)}>Mark complete</button> : <button className="circle-arrow" onClick={() => onAccept(task)} aria-label={`Join ${task.name}`}><Icon name="arrow" size={17} /></button>}</div>
  </article>
}
