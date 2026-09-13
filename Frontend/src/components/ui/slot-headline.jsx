import * as React from "react"
import {
  Sprout,
  Heart,
  BookOpen,
  Users,
  Sparkles,
  Recycle,
} from "lucide-react"
import { cn } from "@/lib/utils"

export const SLOT_ITEMS = [
  { name: "impact", icon: Sparkles, color: "#f4d35e" },
  { name: "matches", icon: Heart, color: "#f38c78" },
  { name: "community", icon: Users, color: "#75e0b0" },
  { name: "skills", icon: BookOpen, color: "#63b5c2" },
  { name: "growth", icon: Sprout, color: "#a3e6c0" },
  { name: "impact", icon: Recycle, color: "#8faeff" },
]

/* Rows are a touch over 1em tall so descenders (g, y) are not clipped. */
const ROW_EM = 1.25

const HIDDEN = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  borderWidth: 0,
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(query.matches)
    const onChange = () => setReduced(query.matches)
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])
  return reduced
}

/**
 * SlotHeadline – a headline whose last word sits in a badge and scrolls
 * like a slot machine, stepping through `items` and looping without a seam.
 *
 * Every row is rendered at all times so the badge stays as wide as the
 * longest word and never resizes as the word changes. Only a transform
 * animates. Great for preloaders / "loading your matches" moments.
 */
export function SlotHeadline({
  prefix = "Deploy your apps from",
  items = SLOT_ITEMS,
  interval = 1900,
  duration = 600,
  playing = true,
  onIndexChange,
  as: Tag = "h1",
  className,
  badgeClassName,
  iconClassName,
  ...props
}) {
  const rotates = items.length > 1
  const [index, setIndex] = React.useState(0)
  const [animate, setAnimate] = React.useState(true)
  const reduced = usePrefersReducedMotion()

  React.useEffect(() => {
    if (!playing || !rotates) return
    const id = setInterval(
      () => setIndex((value) => (value >= items.length ? value : value + 1)),
      Math.max(duration, interval)
    )
    return () => clearInterval(id)
  }, [playing, rotates, items.length, interval, duration])

  React.useEffect(() => {
    if (index === items.length) {
      const timer = setTimeout(() => {
        setAnimate(false)
        setIndex(0)
      }, duration)
      return () => clearTimeout(timer)
    }
    if (index === 0 && !animate) {
      const raf = requestAnimationFrame(() => setAnimate(true))
      return () => cancelAnimationFrame(raf)
    }
  }, [index, animate, items.length, duration])

  const current = items.length ? index % items.length : 0

  React.useEffect(() => {
    onIndexChange?.(current)
    // Reporting the word, not every render that carries it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  const rows = rotates ? [...items, items[0]] : items
  const motion = reduced ? "none" : `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`

  return (
    <Tag className={cn("slot-headline", className)} {...props}>
      {prefix ? <span className="slot-headline-prefix">{prefix}</span> : null}
      <span className={cn("slot-badge", badgeClassName)} aria-hidden="true">
        <span style={HIDDEN}>{items[current]?.name}</span>
        <span className="slot-window">
          <span
            className="slot-track"
            style={{
              transform: `translateY(${-index * ROW_EM}em)`,
              transition: animate ? motion : "none",
            }}
          >
            {rows.map(({ name, icon: Mark, color }, i) => (
              <span className="slot-row" key={i} style={{ color: color || "currentColor" }}>
                {Mark ? (
                  <Mark
                    size="0.85em"
                    className={cn("slot-mark", iconClassName)}
                    style={{ color: color || "currentColor" }}
                  />
                ) : null}
                {name}
              </span>
            ))}
          </span>
        </span>
      </span>
    </Tag>
  )
}

/**
 * SlotLoader – small wrapper used as a loading/preloader state when the app
 * is talking to the database. Rendered anywhere a fetch is in flight.
 */
export function SlotLoader({
  message = "Fetching the good stuff",
  help = "Hang tight a moment",
  items = SLOT_ITEMS,
  compact = false,
  className,
}) {
  return (
    <div className={cn("slot-loader", compact && "slot-loader--compact", className)} role="status">
      <SlotHeadline
        as="div"
        prefix={message}
        items={[{ name: "matches", icon: Sparkles, color: "#f4d35e" }, ...items]}
        badgeClassName="slot-loader-badge"
        iconClassName="slot-loader-icon"
      />
      <p className="slot-loader-help">{help}</p>
    </div>
  )
}

export default SlotHeadline