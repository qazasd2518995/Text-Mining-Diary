'use client'

interface LikertScaleProps {
  name: string
  value: number | null
  onChange: (v: number) => void
  labels?: { low: string; high: string }
}

const defaultLabels = {
  low: '1 = Strongly disagree',
  high: '5 = Strongly agree',
}

export default function LikertScale({
  name,
  value,
  onChange,
  labels = defaultLabels,
}: LikertScaleProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-1.5 sm:gap-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`
              relative flex items-center justify-center
              w-[44px] h-[44px] sm:w-13 sm:h-13
              rounded-full text-sm sm:text-base font-semibold
              transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:ring-offset-2 focus:ring-offset-stone-50
              ${
                value === n
                  ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white scale-110 shadow-[0_2px_12px_rgba(20,184,166,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] border-2 border-teal-400/30'
                  : 'bg-white text-stone-400 border-2 border-stone-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] hover:border-teal-300 hover:text-teal-600 hover:scale-105 hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02),0_2px_8px_rgba(20,184,166,0.1)]'
              }
            `}
            aria-label={`${name} - ${n}`}
          >
            {n}
            {value === n && (
              <span className="absolute inset-0 rounded-full bg-white/10 animate-pulse-glow" />
            )}
          </button>
        ))}
        {/* Hidden radio inputs for form semantics */}
        {[1, 2, 3, 4, 5].map((n) => (
          <input
            key={n}
            type="radio"
            name={name}
            value={n}
            checked={value === n}
            onChange={() => onChange(n)}
            className="sr-only"
            tabIndex={-1}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] sm:text-[11px] text-stone-400 font-[family-name:var(--font-body)] px-0.5 sm:px-1 tracking-wide">
        <span className="opacity-70 max-w-[45%]">{labels.low}</span>
        <span className="opacity-70 max-w-[45%] text-right">{labels.high}</span>
      </div>
    </div>
  )
}
