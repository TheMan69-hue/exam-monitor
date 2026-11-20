export function StatStrip({
  stats,
}: {
  stats: { value: number; label: string }[]
}) {
  return (
    <div className="stat-strip" role="group" aria-label="Summary">
      {stats.map((stat, index) => (
        <span key={stat.label} className="flex items-center gap-8">
          {index > 0 && (
            <span aria-hidden="true" className="-ml-8 text-mint-mist">
              |
            </span>
          )}
          <span>
            <b className="font-semibold">{stat.value}</b> {stat.label}
          </span>
        </span>
      ))}
    </div>
  )
}
