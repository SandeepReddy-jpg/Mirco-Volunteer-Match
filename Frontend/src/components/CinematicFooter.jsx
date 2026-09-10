import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const MarqueeItem = () => (
  <div className="cinematic-marquee-item">
    <span>Small actions</span><b></b><span>Real impact</span><b></b><span>Community first</span><b></b><span>Every goodturn counts</span><b></b>
  </div>
)

export default function CinematicFooter() {
  const wrapperRef = useRef(null)
  const giantTextRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(giantTextRef.current, { y: 80, opacity: 0 }, {
        y: 0,
        opacity: 1,
        ease: 'power2.out',
        scrollTrigger: { trigger: wrapperRef.current, start: 'top 85%', end: 'bottom bottom', scrub: 1 },
      })
      gsap.fromTo(contentRef.current?.children || [], { y: 36, opacity: 0 }, {
        y: 0,
        opacity: 1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: wrapperRef.current, start: 'top 75%', end: 'bottom bottom', scrub: 1 },
      })
    }, wrapperRef)
    return () => context.revert()
  }, [])

  return (
    <section ref={wrapperRef} className="cinematic-footer" aria-label="Footer">
      <div className="cinematic-aurora" />
      <div className="cinematic-grid" />
      <div className="cinematic-marquee"><div><MarqueeItem /><MarqueeItem /></div></div>
      <div ref={giantTextRef} className="cinematic-giant-text" aria-hidden="true">GOOD</div>
      <div ref={contentRef} className="cinematic-footer-content">
        <span className="cinematic-kicker">MICRO-VOLUNTEER MATCH</span>
        <h2>Ready to begin?</h2>
        <p>Find a small way to help, then watch it travel through your community.</p>
        <div className="cinematic-footer-actions">
          <a href="#discover">Browse opportunities <span></span></a>
          <a href="#top">Back to top <span></span></a>
        </div>
      </div>
      <div className="cinematic-footer-bottom"><span> 2026 Micro-Volunteer Match</span><span>Crafted with <i></i> for local good</span></div>
    </section>
  )
}
