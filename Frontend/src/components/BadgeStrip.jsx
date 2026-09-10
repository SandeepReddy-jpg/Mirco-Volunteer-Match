import Icon from './Icon.jsx'

export default function BadgeStrip({ badges = [] }) {
  const visibleBadges = badges.length ? badges : ['Rookie']
  const badgeType = (badge) => badge.toLowerCase().replaceAll(' ', '-')
  const badgeIcon = (badge) => badge.includes('Ten') ? 'spark' : badge.includes('Five') ? 'people' : badge.includes('First') ? 'check' : 'clock'
  return <section className="badge-strip">
    <div><span className="eyebrow"><span className="eyebrow-line" /> YOUR BADGES</span><h2>Every goodturn leaves a <em>mark.</em></h2><p>Complete opportunities to unlock more recognition from your community.</p></div>
    <div className="badge-list">{visibleBadges.map((badge) => <span className={`badge-pill badge-${badgeType(badge)}`} key={badge}><span className="badge-emblem"><Icon name={badgeIcon(badge)} size={18} /></span><strong>{badge}</strong><small>{badge.includes('Ten') ? '10+ completed' : badge.includes('Five') ? '5+ completed' : badge.includes('First') ? 'First impact' : 'Getting started'}</small></span>)}</div>
  </section>
}
