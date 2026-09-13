import { useState } from 'react'
import Icon from './Icon.jsx'

const SKILL_OPTIONS = [
  'Teaching', 'Tutoring', 'Coding', 'Design', 'Writing',
  'Gardening', 'Cooking', 'First Aid', 'Music', 'Languages',
  'Photography', 'Data Analysis', 'Social Media', 'Carpentry', 'Sports Coaching',
]

const INTEREST_OPTIONS = [
  'Education', 'Environment', 'Community', 'Health & Wellbeing',
  'Food Security', 'Animal Welfare', 'Youth Programs', 'Elderly Care',
  'Arts & Culture', 'Climate Action', 'Technology', 'Mental Health',
]

export default function OnboardingForm({ userName, onComplete, onSkip }) {
  const [selectedSkills, setSelectedSkills] = useState([])
  const [selectedInterests, setSelectedInterests] = useState([])
  const [step, setStep] = useState(1) // 1 = skills, 2 = interests
  const [saving, setSaving] = useState(false)

  const toggle = (list, setList, value) => {
    setList((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const handleNext = () => {
    if (step === 1) setStep(2)
    else handleSubmit()
  }

  const handleSubmit = async () => {
    setSaving(true)
    await onComplete({ skills: selectedSkills, interest: selectedInterests })
    setSaving(false)
  }

  const firstName = (userName || 'there').split(' ')[0]

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onSkip()}>
      <div className="onboarding-modal" role="dialog" aria-modal="true" aria-label="Tell us about yourself">
        {/* Progress bar */}
        <div className="onboarding-progress">
          <div
            className="onboarding-progress-fill"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>

        <button type="button" className="modal-close" onClick={onSkip}>
          <Icon name="close" size={18} />
        </button>

        <div className="eyebrow">
          <span className="eyebrow-line" /> STEP {step} OF 2
        </div>

        <h2 className="onboarding-heading">
          {step === 1
            ? <>Welcome, <em>{firstName}.</em><br />What are your skills?</>
            : <>What causes do<br />you <em>care about?</em></>}
        </h2>

        <p className="onboarding-sub">
          {step === 1
            ? "We'll match you with opportunities where your talents are needed most."
            : "Pick the areas that feel closest to your heart — we'll prioritize those matches."}
        </p>

        {/* Chip grid */}
        <div className="onboarding-chips">
          {(step === 1 ? SKILL_OPTIONS : INTEREST_OPTIONS).map((item) => {
            const active = (step === 1 ? selectedSkills : selectedInterests).includes(item)
            return (
              <button
                key={item}
                type="button"
                className={`onboarding-chip ${active ? 'active' : ''}`}
                onClick={() =>
                  step === 1
                    ? toggle(selectedSkills, setSelectedSkills, item)
                    : toggle(selectedInterests, setSelectedInterests, item)
                }
              >
                {active && <Icon name="check" size={12} />}
                {item}
              </button>
            )
          })}
        </div>

        <div className="onboarding-actions">
          <button
            type="button"
            className="button full onboarding-next"
            onClick={handleNext}
            disabled={saving}
          >
            {saving ? (
              <><span className="join-spinner" /> Saving…</>
            ) : step === 1 ? (
              <>Next: Interests <Icon name="arrow" size={16} /></>
            ) : (
              <>Find my matches <Icon name="arrow" size={16} /></>
            )}
          </button>
          <button type="button" className="switch-auth" onClick={onSkip}>
            Skip for now — I'll update my profile later
          </button>
        </div>
      </div>
    </div>
  )
}
