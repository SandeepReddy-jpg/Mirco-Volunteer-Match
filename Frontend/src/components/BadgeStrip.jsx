import Icon from './Icon.jsx'

export default function BadgeStrip({ badges = [] }) {
  const visibleBadges = badges.length ? badges : ['Rookie']
  return <section className="badge-strip">
    <div><span className="eyebrow"><span className="eyebrow-line" /> YOUR BADGES</span><h2>Every goodturn leaves a <em>mark.</em></h2><p>Complete opportunities to unlock more recognition from your community.</p></div>
    <div className="badge-list">{visibleBadges.map((badge) => <span className="badge-pill" key={badge}><span className="badge-emblem"><Icon name="spark" size={16} /></span><span>{badge}</span></span>)}</div>
  </section>
}
