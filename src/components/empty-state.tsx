export function EmptyState({
  title,
  children,
}: {
  title: string
  children?: React.ReactNode
}) {
  const ink = '#231e21'

  return (
    <div className="card flex flex-col items-center gap-3 py-10 text-center">
      <svg
        viewBox="0 0 120 90"
        fill="none"
        aria-hidden="true"
        className="w-32"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="10" y="14" width="100" height="66" rx="8" fill="#fff" stroke={ink} strokeWidth="2" />
        <path d="M10 32h100" stroke={ink} strokeWidth="2" />
        <circle cx="22" cy="23" r="2.5" fill="#d6aec1" stroke={ink} strokeWidth="1.5" />
        <circle cx="32" cy="23" r="2.5" fill="#cae1e2" stroke={ink} strokeWidth="1.5" />
        <circle cx="42" cy="23" r="2.5" fill="#65b8a2" stroke={ink} strokeWidth="1.5" />
        <path d="M26 48h44M26 58h60M26 68h30" stroke="#a2cbcd" strokeWidth="2" strokeDasharray="2 5" />
        <path d="M102 6l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="#d6aec1" stroke={ink} strokeWidth="1.5" />
        <circle cx="8" cy="78" r="5" stroke="#65b8a2" strokeWidth="2" />
      </svg>
      <p className="font-serif text-2xl">{title}</p>
      {children && <p className="max-w-md text-sm">{children}</p>}
    </div>
  )
}
