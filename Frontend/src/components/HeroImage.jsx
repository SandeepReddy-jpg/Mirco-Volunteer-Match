/**
 * HeroImage – real volunteer photograph on the hero right column.
 * Photo lives in /public (served at /hero_volunteering.jpg).
 */
export default function HeroImage() {
  return (
    <div className="hero-art">
      <img
        src="/hero_volunteering.jpg"
        alt="A volunteer giving a tutoring session to a learner"
        className="hero-illustration"
        loading="lazy"
      />

      {/* Floating info card */}
      <div className="hero-info-card">
        <span className="hero-info-dot" />
        <div>
          <small>LEARNING TOGETHER</small>
          <b>1-on-1 tutoring session</b>
        </div>
        <span className="hero-info-arrow">→</span>
      </div>
    </div>
  )
}