export default function Icon({ name, size = 18 }) {
  const paths = {
    arrow:   <path d="M5 12h13m-6-6 6 6-6 6" />,
    spark:   <path d="m12 3 1.7 6.3L20 11l-6.3 1.7L12 19l-1.7-6.3L4 11l6.3-1.7L12 3Z" />,
    search:  <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    clock:   <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>,
    people:  <><path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" /><circle cx="10" cy="8" r="3" /><path d="M16 5.2a3 3 0 0 1 0 5.6M19 20v-1.2a3.5 3.5 0 0 0-2.5-3.35" /></>,
    check:   <path d="m5 12 4 4L19 6" />,
    menu:    <path d="M4 7h16M4 12h16M4 17h16" />,
    close:   <path d="m6 6 12 12M18 6 6 18" />,
    bell:    <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4" /></>,
    user:    <><circle cx="12" cy="8" r="3.5" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    plus:    <path d="M12 5v14M5 12h14" />,
    edit:    <><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" /><path d="m14 7 3 3" /></>,
    logout:  <><path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-5" /></>,
    heart:   <path d="M20.8 8.8c0 5.4-8.8 10.2-8.8 10.2S3.2 14.2 3.2 8.8A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.6Z" />,
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
