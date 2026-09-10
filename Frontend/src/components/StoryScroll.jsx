import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const cards = [
  {
    number: '01',
    label: 'For every neighbour',
    title: <>Find your <em>goodturn.</em></>,
    copy: 'Browse small, real opportunities that fit your time, interests, and energy today.',
    accent: 'yellow',
  },
  {
    number: '02',
    label: 'For volunteers',
    title: <>Show up as <em>you are.</em></>,
    copy: 'Bring the skills you already have and meet people who care about the same things.',
    accent: 'mint',
    stats: ['5 min to 1 day', 'Local opportunities', 'No experience needed'],
  },
  {
    number: '03',
    label: 'For organizers',
    title: <>Make it easy to <em>join in.</em></>,
    copy: 'Post a clear opportunity, welcome the right people, and keep your community moving.',
    accent: 'coral',
    stats: ['Create in minutes', 'Track sign-ups', 'Grow your reach'],
  },
  {
    number: '04',
    label: 'The ripple effect',
    title: <>Small actions. <em>Real impact.</em></>,
    copy: 'Every completed task becomes proof that a kinder, more connected community is possible.',
    accent: 'blue',
  },
]

export default function StoryScroll() {
  const storyRef = useRef(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = () => setReducedMotion(mediaQuery.matches)
    updateMotion()
    mediaQuery.addEventListener('change', updateMotion)
    return () => mediaQuery.removeEventListener('change', updateMotion)
  }, [])

  useEffect(() => {
    if (reducedMotion || !storyRef.current) return undefined

    const context = gsap.context(() => {
      const sections = gsap.utils.toArray('[data-story-card]')
      sections.forEach((section, index) => {
        gsap.set(section, { zIndex: index + 1 })
        if (index === 0) return
        gsap.fromTo(section,
          { rotation: 8, y: 70, transformOrigin: 'bottom left' },
          {
            rotation: 0,
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top 90%',
              end: 'top 42%',
              scrub: true,
            },
          },
        )
      })
      ScrollTrigger.refresh()
    }, storyRef)

    return () => context.revert()
  }, [reducedMotion])

  return (
    <section ref={storyRef} className="story-scroll" aria-label="How Micro-Volunteer Match works">
      <div className="story-scroll-heading container">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> ONE PLATFORM, MANY WAYS TO HELP</div>
          <h2>Good things <em>move.</em></h2>
        </div>
        <p>Whether you have five minutes or a project to lead, there is a place for you here.</p>
      </div>
      <div className="story-scroll-stack container">
        {cards.map((card) => (
          <article className={`story-card story-card-${card.accent}`} data-story-card key={card.number}>
            <div className="story-card-top"><span>{card.number}</span><span>{card.label}</span></div>
            <div className="story-card-main">
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
              {card.stats && <div className="story-card-stats">{card.stats.map((stat) => <span key={stat}>{stat}</span>)}</div>}
            </div>
            <span className="story-card-arrow">-&gt;</span>
          </article>
        ))}
      </div>
    </section>
  )
}
