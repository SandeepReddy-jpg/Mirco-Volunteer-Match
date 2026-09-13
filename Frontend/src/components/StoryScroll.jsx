import FlowArt, { FlowSection } from './ui/story-scroll.jsx'

const sections = [
  {
    number: '01',
    label: 'For every neighbour',
    headline: ['One Platform,', 'Many Ways', 'To Help'],
    copy: 'Browse small, real opportunities that fit your time, interests, and energy today.',
    bg: '#75e0b0',
    ink: '#0d2e2a',
    hr: 'border-black/60',
  },
  {
    number: '02',
    label: 'For volunteers',
    headline: ['Good things', 'move.'],
    copy: 'Bring the skills you already have and meet people who care about the same things.',
    bg: '#f4d35e',
    ink: '#332400',
    hr: 'border-black/60',
    stats: [
      ['5 min to 1 day', 'Pick micro-tasks that fit your schedule.'],
      ['Local opportunities', 'Help neighbours on your own street.'],
      ['No experience needed', 'Show up as you are.'],
    ],
  },
  {
    number: '03',
    label: 'For organizers',
    headline: ['Show up,', 'lend a hand.'],
    copy: 'Post a clear opportunity, welcome the right people, and keep your community moving.',
    bg: '#aebdff',
    ink: '#1e2a5a',
    hr: 'border-black/60',
    stats: [
      ['Create in minutes', 'Post a clear opportunity fast.'],
      ['Track sign-ups', 'See who joined in real time.'],
      ['Grow your reach', 'Emails notify your community.'],
    ],
  },
  {
    number: '04',
    label: 'The ripple effect',
    headline: ['Small actions.', 'Real impact.'],
    copy: 'Every completed task becomes proof that a kinder, more connected community is possible.',
    bg: '#ed705c',
    ink: '#3a1408',
    hr: 'border-black/60',
  },
]

export default function StoryScroll() {
  return (
    <FlowArt aria-label="ONE PLATFORM, MANY WAYS TO HELP">
      {sections.map((section) => (
        <FlowSection
          key={section.number}
          aria-label={section.label}
          style={{ backgroundColor: section.bg, color: section.ink }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em]">
            {section.number} — {section.label}
          </p>
          <hr className={`my-[1.5vw] border-0 border-t ${section.hr}`} />
          <div>
            <h2 className="text-[clamp(2.5rem,7.5vw,7rem)] font-bold leading-[0.95] uppercase tracking-tight">
              {section.headline.map((line) => (
                <span className="block" key={line}>
                  {line}
                </span>
              ))}
            </h2>
          </div>
          <hr className={`my-[1.5vw] border-0 border-t ${section.hr}`} />
          <p className="mt-auto max-w-[50ch] text-[clamp(0.9rem,1.7vw,1.35rem)] font-normal leading-relaxed">
            {section.copy}
          </p>
          {section.stats && (
            <div className="flex flex-wrap gap-[3vw]">
              {section.stats.map(([title, sub]) => (
                <div className="min-w-[150px] flex-1" key={title}>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider">{title}</p>
                  <p className="text-[clamp(0.8rem,1.1vw,0.95rem)] leading-relaxed opacity-75">
                    {sub}
                  </p>
                </div>
              ))}
            </div>
          )}
        </FlowSection>
      ))}
    </FlowArt>
  )
}