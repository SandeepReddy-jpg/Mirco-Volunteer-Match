import React, { Children, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

export function FlowSection({ className, style = {}, 'aria-label': ariaLabel, children }) {
  return (
    <section
      data-flow-section
      aria-label={ariaLabel}
      className={cx('relative min-h-[100vh] w-full overflow-hidden', className)}
    >
      <div
        data-flow-inner
        className={cx(
          'flow-art-container relative flex min-h-[100vh] w-full flex-col justify-between gap-5 px-[4vw] pt-[clamp(1.5rem,5vw,2.5rem)] pb-[3vw]',
          'will-change-transform',
        )}
        style={{ transformOrigin: 'bottom left', ...style }}
      >
        {children}
      </div>
    </section>
  )
}

const childCount = (children) => Children.count(children)

export default function FlowArt({ children, className, id, 'aria-label': ariaLabel = 'Story scroll' }) {
  const containerRef = useRef(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container || reducedMotion) return

    const ctx = gsap.context(() => {
      const sections = Array.from(
        container.querySelectorAll('[data-flow-section]'),
      )
      if (sections.length === 0) return

      sections.forEach((section, i) => {
        gsap.set(section, { zIndex: i + 1 })

        const inner = section.querySelector('.flow-art-container')
        if (!inner) return

        if (i > 0) {
          gsap.set(inner, {
            rotation: 10,
            scale: 1.05,
            transformOrigin: 'bottom left',
          })
          gsap.to(inner, {
            rotation: 0,
            scale: 1,
            ease: 'power1.out',
            force3D: true,
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'top 12%',
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          })
        }

        if (i < sections.length - 1) {
          ScrollTrigger.create({
            trigger: section,
            start: 'bottom bottom',
            end: 'bottom top',
            pin: true,
            pinSpacing: false,
            anticipatePin: 1,
          })
        }
      })

      ScrollTrigger.refresh()
    }, container)

    return () => ctx.revert()
  }, [reducedMotion, childCount(children)])

  return (
    <section
      ref={containerRef}
      id={id}
      aria-label={ariaLabel}
      className={cx('relative z-10 w-full overflow-x-hidden', className)}
    >
      {children}
    </section>
  )
}