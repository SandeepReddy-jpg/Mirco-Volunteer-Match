import TextBlockAnimation from './TextBlockAnimation.jsx'

const featureCards = [
  {
    number: '01',
    label: 'ORGANIZER TOOLKIT',
    title: 'Post a task in minutes.',
    copy: 'Describe the help you need, choose a category, and invite your community to show up.',
    tone: 'feature-yellow',
    detailLabel: 'TASK BUILDER',
    details: [['Opportunity title', 'Ready'], ['Community category', 'Selected'], ['Volunteer spots', 'Open']],
  },
  {
    number: '02',
    label: 'SMART OUTREACH',
    title: 'Keep everyone in the loop.',
    copy: 'When an opportunity is created, registered users receive a clear email with the task details.',
    tone: 'feature-mint',
    detailLabel: 'EMAIL BROADCAST',
    details: [['Task created', 'Sent'], ['12 members notified', 'Delivered'], ['Delivery in progress', 'Live']],
  },
  {
    number: '03',
    label: 'VISIBLE MOMENTUM',
    title: 'Watch good work gather pace.',
    copy: 'Volunteers accept tasks, organizers track sign-ups, and every completed action adds to the story.',
    tone: 'feature-coral',
    detailLabel: 'IMPACT DASHBOARD',
    details: [['7 volunteers joined', 'Active'], ['3 tasks completed', 'Recorded'], ['Community rating 4.9', 'Strong']],
  },
]

export default function Features() {
  return (
    <section className="homepage-features" aria-label="Goodturn features">
      <div className="container homepage-features-heading">
        <TextBlockAnimation blockColor="#75e0b0" animateOnScroll={false}>
          <div className="eyebrow light"><span className="eyebrow-line" /> BUILT FOR ACTION, NOT ADMIRATION</div>
          <h2>Turn a good idea into <em>a goodturn.</em></h2>
        </TextBlockAnimation>
        <p>One place to post the task, reach the right people, and see what happens next.</p>
        <div className="homepage-feature-tags"><span>CREATE OPPORTUNITIES</span><span>NOTIFY YOUR COMMUNITY</span><span>MEASURE IMPACT</span></div>
      </div>
      <div className="container homepage-feature-grid">
        {featureCards.map((card) => (
          <article className={`homepage-feature-card ${card.tone}`} key={card.number}>
            <div className="homepage-feature-top"><span>{card.number}</span><span>{card.label}</span></div>
            <TextBlockAnimation blockColor="#171717">
              <h3>{card.title}</h3>
            </TextBlockAnimation>
            <p>{card.copy}</p>
            <div className="feature-detail"><div className="feature-detail-heading"><small>{card.detailLabel}</small></div>{card.details.map(([detail, status]) => <div className="feature-detail-row" key={detail}><span>{detail}</span><strong>{status}</strong></div>)}</div>
          </article>
        ))}
      </div>
    </section>
  )
}
