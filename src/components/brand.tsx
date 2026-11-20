import Link from 'next/link'

export function Wordmark({ href = '/' }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 font-serif text-xl text-charcoal-navy no-underline"
    >
      <span
        aria-hidden="true"
        className="inline-block h-2.5 w-2.5 rounded-full bg-deep-teal"
      />
      Exam Monitor
    </Link>
  )
}

const INK = '#231e21'

// Hand-drawn style line art: a person inside a browser window.
export function StudentIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      role="img"
      aria-label="Line drawing of a student at a computer"
      className={className}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="10" y="30" width="200" height="140" rx="10" fill="#fff" stroke={INK} strokeWidth="2" />
      <path d="M10 56h200" stroke={INK} strokeWidth="2" />
      <circle cx="26" cy="43" r="3" fill="#d6aec1" stroke={INK} strokeWidth="1.5" />
      <circle cx="38" cy="43" r="3" fill="#cae1e2" stroke={INK} strokeWidth="1.5" />
      <circle cx="50" cy="43" r="3" fill="#65b8a2" stroke={INK} strokeWidth="1.5" />
      <path d="M84 168c0-34 72-34 72 0" fill="#65b8a2" stroke={INK} strokeWidth="2" />
      <circle cx="120" cy="104" r="17" fill="#fff" stroke={INK} strokeWidth="2" />
      <path d="M103 100c2-16 32-16 34 0-8-6-26-6-34 0Z" fill={INK} />
      <circle cx="114" cy="106" r="1.5" fill={INK} />
      <circle cx="126" cy="106" r="1.5" fill={INK} />
      <path d="M114 113q6 4 12 0" stroke={INK} strokeWidth="1.5" />
      <path d="M226 22l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#d6aec1" stroke={INK} strokeWidth="1.5" />
      <circle cx="22" cy="14" r="6" stroke="#65b8a2" strokeWidth="2" />
      <path d="M222 178v14M215 185h14" stroke="#65b8a2" strokeWidth="2" />
    </svg>
  )
}

// A browser window with a short list of reviewable flags.
export function TeacherIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      role="img"
      aria-label="Line drawing of a teacher reviewing a list of flags"
      className={className}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="30" y="30" width="200" height="140" rx="10" fill="#fff" stroke={INK} strokeWidth="2" />
      <path d="M30 56h200" stroke={INK} strokeWidth="2" />
      <circle cx="46" cy="43" r="3" fill="#d6aec1" stroke={INK} strokeWidth="1.5" />
      <circle cx="58" cy="43" r="3" fill="#cae1e2" stroke={INK} strokeWidth="1.5" />
      <circle cx="70" cy="43" r="3" fill="#65b8a2" stroke={INK} strokeWidth="1.5" />
      {[78, 106, 134].map((y, i) => (
        <g key={y}>
          <circle cx="56" cy={y} r="8" fill={i === 1 ? '#d6aec1' : '#cae1e2'} stroke={INK} strokeWidth="1.5" />
          <path d={`M76 ${y - 4}h90M76 ${y + 5}h56`} stroke={INK} strokeWidth="1.5" />
          <rect
            x="178"
            y={y - 8}
            width="38"
            height="16"
            rx="8"
            fill={i === 1 ? '#f2e8e2' : '#e4f0f1'}
            stroke={INK}
            strokeWidth="1.5"
          />
        </g>
      ))}
      <path d="M16 14l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#65b8a2" stroke={INK} strokeWidth="1.5" />
      <circle cx="12" cy="182" r="6" stroke="#d6aec1" strokeWidth="2" />
      <path d="M14 112c-6-14 10-22 14-10" stroke="#65b8a2" strokeWidth="2" />
    </svg>
  )
}
