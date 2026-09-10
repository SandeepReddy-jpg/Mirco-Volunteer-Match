import Icon from './Icon.jsx'

export default function VolunteerProfileModal({ volunteer, onClose }) {
  if (!volunteer) return null
  const person = volunteer.userinfo || volunteer
  const skills = volunteer.skills?.length ? volunteer.skills : person.skills?.length ? person.skills : ['Open to new opportunities']
  const interests = volunteer.interest?.length ? volunteer.interest : person.interest?.length ? person.interest : []

  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="volunteer-profile-modal" role="dialog" aria-modal="true" aria-label={`${person.name || 'Volunteer'} profile`}>
      <button type="button" className="modal-close" onClick={onClose}><Icon name="close" size={18} /></button>
      <div className="profile-modal-avatar">{person.name?.slice(0, 1) || '?'}</div>
      <span className="eyebrow"><span className="eyebrow-line" /> COMMUNITY VOLUNTEER</span>
      <h2>{person.name || 'Community volunteer'}</h2>
      <p className="profile-modal-intro">Ready to bring time, skills, and care to the work.</p>
      <div className="profile-modal-rating"><strong>{person.rating || volunteer.rating || 'New'}</strong><span>impact rating</span></div>
      <div className="profile-modal-section"><small>SKILLS</small><div>{skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div>
      {interests.length > 0 && <div className="profile-modal-section"><small>INTERESTS</small><div>{interests.map((interest) => <span key={interest}>{interest}</span>)}</div></div>}
      {person.email && <a className="button full profile-contact" href={`mailto:${person.email}`}>Contact volunteer <Icon name="arrow" size={16} /></a>}
    </section>
  </div>
}
