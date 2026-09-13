import React, { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { CustomEase } from "gsap/CustomEase"
import { cn } from "@/lib/utils"
import Icon from "../Icon.jsx"

/* Register GSAP plugins safely */
if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase)
}

/**
 * KineticNavigation – the "sterling-gate" inspired sidebar-after-login.
 * A floating trigger opens an overlay drawer whose backdrop panels
 * and links are choreographed with GSAP.
 */
export default function KineticNavigation({
  userName = "friend",
  role = "volunteer",
  items = [],
  active = "overview",
  onSelect,
  onLogout,
  onCreate,
  createLabel = "Post an opportunity",
  className,
  testId,
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  /* Custom easing once, safely */
  useEffect(() => {
    try {
      if (!gsap.parseEase("kinetic")) {
        CustomEase.create("kinetic", "0.65, 0.01, 0.05, 0.99")
      }
      gsap.defaults({ ease: "power3.out", duration: 0.45 })
    } catch (error) {
      console.warn("CustomEase failed to load, falling back to default.", error)
      gsap.defaults({ ease: "power2.out", duration: 0.7 })
    }
  }, [])

  /* Open / close choreography */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      const overlay = root.querySelector(".kin-overlay")
      const dim = root.querySelector(".kin-dim")
      const menu = root.querySelector(".kin-menu")
      const panels = root.querySelectorAll(".kin-panel")
      const links = root.querySelectorAll(".kin-link")
      const shapes = root.querySelectorAll(".kin-shape")
      const head = root.querySelector(".kin-head")
      const createBtn = root.querySelector(".kin-create")

      const tl = gsap.timeline()

      if (open) {
        /* OPEN — fast, decelerating snap */
        overlay?.setAttribute("data-kin", "open")
        dim?.setAttribute("data-kin", "open")
        if (overlay) tl.set(overlay, { autoAlpha: 1 })
        tl.fromTo(dim, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22, ease: "power2.out" }, 0)
          .fromTo(panels, { xPercent: 101 }, { xPercent: 0, stagger: 0.05, duration: 0.42, ease: "power3.out" }, 0.03)
          .fromTo(
            shapes,
            { scale: 0.3, opacity: 0, rotation: -12 },
            { scale: 1, opacity: 1, rotation: 0, duration: 0.38, stagger: 0.04, ease: "back.out(1.5)" },
            "-=0.28"
          )
          .fromTo(head, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out" }, "-=0.22")
          .fromTo(
            links,
            { yPercent: 130, rotate: 8 },
            { yPercent: 0, rotate: 0, stagger: 0.032, duration: 0.34, ease: "power3.out" },
            "-=0.18"
          )
        if (createBtn) {
          tl.fromTo(createBtn, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" }, "-=0.14")
        }
        tl.to(menu, { autoAlpha: 1, duration: 0.15 }, "<")
      } else {
        /* CLOSE — quick, tidy exit */
        overlay?.setAttribute("data-kin", "closed")
        dim?.setAttribute("data-kin", "closed")
        if (links.length) {
          tl.to(links, { yPercent: 130, rotate: 6, stagger: 0.012, duration: 0.18, ease: "power2.in" })
            .to(panels, { xPercent: 101, stagger: 0.035, duration: 0.28, ease: "power3.in" }, "<")
            .to(shapes, { opacity: 0, scale: 0.7, duration: 0.18, ease: "power2.in" }, "<")
            .to(menu, { autoAlpha: 0, duration: 0.12 }, "<")
            .to(dim, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, "<")
            .to(overlay, { autoAlpha: 0, duration: 0.03 }, "+=0.18")
        } else {
          tl.to(menu, { autoAlpha: 0, duration: 0.12 })
            .to(dim, { autoAlpha: 0, duration: 0.2 }, "<")
            .to(overlay, { autoAlpha: 0, duration: 0.03 })
        }
      }
    }, root)

    return () => ctx.revert()
  }, [open])

  /* Escape to close */
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape" && open) setOpen(false)
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [open])

  const chooseTab = (id) => {
    onSelect?.(id)
    setOpen(false)
  }

  const firstName = (userName || "friend").split(" ")[0]

  return (
    <div
      className={cn("kin-navigation", open && "kin-navigation--open", className)}
      ref={rootRef}
      data-testid={testId}
    >
      {/* Floating trigger */}
      <button
        type="button"
        className="kin-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <span className="kin-trigger-label">menu</span>
        <span className="kin-trigger-icon" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>

      {/* Dim the rest of the screen (click to close) */}
      <button
        type="button"
        className="kin-dim"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      {/* Overlay menu — slides in from the right */}
      <div className="kin-overlay" role="dialog" aria-label="Dashboard menu">
        <span className="kin-panel kin-panel--1" />
        <span className="kin-panel kin-panel--2" />
        <span className="kin-panel kin-panel--3" />

        {/* Menu content */}
        <div className="kin-menu">
          <header className="kin-head">
            <span className="kin-head-avatar">{firstName.slice(0, 1).toUpperCase()}</span>
            <div>
              <small>{role === "organizer" || role === "admin" ? "ORGANIZER SPACE" : "WELCOME BACK"}</small>
              <strong>{userName}</strong>
            </div>
          </header>

          <nav className="kin-links" aria-label="Dashboard navigation">
            <ul>
              {items.map(({ id, label, icon }) => (
                <li key={id}>
                  <button
                    type="button"
                    className={cn("kin-link", id === active && "is-active")}
                    onClick={() => chooseTab(id)}
                  >
                    <Icon name={icon} size={20} />
                    <span>{label}</span>
                    <span className="kin-link-arrow">
                      <Icon name="arrow" size={16} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="kin-actions">
            {onCreate && (
              <button type="button" className="kin-create" onClick={() => { onCreate(); setOpen(false) }}>
                <Icon name="plus" size={16} /> {createLabel}
              </button>
            )}
            {onLogout && (
              <button type="button" className="kin-logout" onClick={onLogout}>
                <Icon name="logout" size={16} /> Log out
              </button>
            )}
            <p className="kin-foot">Small actions. Real impact.</p>
          </div>
        </div>
      </div>
    </div>
  )
}