import { useState } from 'react'
import { OrderTracking } from './ui/order-tracking.jsx'
import Icon from './Icon.jsx'

/**
 * Derives tracking steps from a task's status and metadata.
 */
function getTrackingSteps(task) {
  const now = new Date()
  const fmt = (d) =>
    new Date(d).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })

  const createdAt = task.createdAt ? fmt(task.createdAt) : fmt(now)
  const isAccepted =
    task.status === 'accepted' || task.status === 'completed' || (task.accepted?.length || 0) > 0
  const isCompleted = task.status === 'completed'

  return [
    {
      name: 'Opportunity posted',
      timestamp: createdAt,
      isCompleted: true,
    },
    {
      name: 'Volunteers found',
      timestamp: isAccepted ? `${task.accepted?.length || 1} volunteer(s) joined` : 'Waiting for sign-ups',
      isCompleted: isAccepted,
    },
    {
      name: 'Activity in progress',
      timestamp: isAccepted ? 'Community is showing up' : 'Pending',
      isCompleted: isAccepted && !isCompleted,
    },
    {
      name: 'Impact delivered',
      timestamp: isCompleted ? 'Marked complete — great work!' : 'Pending',
      isCompleted: isCompleted,
    },
  ]
}

export default function TaskTracking({ task, onClose }) {
  if (!task) return null
  const steps = getTrackingSteps(task)

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="task-tracking-modal" role="dialog" aria-modal="true" aria-label={`Tracking: ${task.name}`}>
        <button type="button" className="modal-close" onClick={onClose}>
          <Icon name="close" size={18} />
        </button>

        <div className="eyebrow">
          <span className="eyebrow-line" /> TASK PROGRESS
        </div>
        <h2 className="task-tracking-title">{task.name}</h2>
        <p className="task-tracking-sub">
          {task.category?.[0] || 'Community'} · {task.time || '2 hrs'}
        </p>

        <div className="task-tracking-body">
          <OrderTracking steps={steps} />
        </div>

        <div className="task-tracking-footer">
          <span className="task-tracking-stat">
            <Icon name="people" size={14} />
            {(task.accepted?.length || 0)}/{task.members || 1} filled
          </span>
          <span
            className={`status-pill ${
              task.status === 'completed' ? 'done' : 'active-pill'
            }`}
          >
            {task.status === 'completed' ? 'Completed' : 'Active'}
          </span>
        </div>
      </div>
    </div>
  )
}
