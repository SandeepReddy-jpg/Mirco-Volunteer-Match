import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function TextBlockAnimation({ children, animateOnScroll = true, delay = 0, blockColor = '#f4d35e', duration = 0.65 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const block = document.createElement('span')
    block.className = 'text-block-revealer'
    block.style.backgroundColor = blockColor
    container.appendChild(block)

    const animation = gsap.timeline({
      delay,
      scrollTrigger: animateOnScroll ? {
        trigger: container,
        start: 'top 84%',
        toggleActions: 'play none none reverse',
      } : undefined,
    })
      .set(container, { opacity: 1 })
      .fromTo(block, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration, ease: 'expo.inOut' })
      .set(container.children, { opacity: 1 }, `<${duration * 0.45}`)
      .to(block, { scaleX: 0, transformOrigin: 'right center', duration, ease: 'expo.inOut' }, `<${duration * 0.4}`)

    return () => {
      animation.scrollTrigger?.kill()
      animation.kill()
      block.remove()
    }
  }, [animateOnScroll, blockColor, delay, duration])

  return <div ref={containerRef} className="text-block-animation">{children}</div>
}
