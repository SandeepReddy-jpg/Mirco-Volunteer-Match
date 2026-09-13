import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Lenis smooth scrolling driven by GSAP's ticker.
 * Renders nothing — it just makes native wheel/touch scrolling glide
 * and keeps every ScrollTrigger perfectly in sync with the eased scroll.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1, // lower = longer glide (0.05 = very floaty, 0.15 = snappy)
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      anchors: true, // smooth-glide for in-page #anchor links
      force3D: true,
    })

    // Drive Lenis from GSAP's ticker so ScrollTrigger sees the same eased values
    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    return () => {
      lenis.off('scroll', onScroll)
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  return null
}
