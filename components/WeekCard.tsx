'use client'

interface WeekCardProps {
  week: number
  status: 'completed' | 'current' | 'upcoming' | 'draft'
  onClick: () => void
}

export default function WeekCard({ week, status, onClick }: WeekCardProps) {
  const isDisabled = status === 'upcoming'

  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={`
        group relative w-full text-left rounded-2xl border p-3.5 sm:p-5
        transition-all duration-300 ease-out
        focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:ring-offset-2
        ${status === 'current'
          ? 'border-2 border-teal-400/50 bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:scale-[1.01] cursor-pointer animate-border-glow'
          : status === 'completed'
          ? 'border-emerald-200/60 bg-gradient-to-br from-white to-emerald-50/30 hover:shadow-[0_6px_24px_rgba(0,0,0,0.05)] hover:-translate-y-1 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.02)]'
          : status === 'draft'
          ? 'border-amber-200/60 bg-gradient-to-br from-white to-amber-50/20 hover:shadow-[0_6px_24px_rgba(0,0,0,0.05)] hover:-translate-y-1 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.02)]'
          : 'border-stone-100 bg-stone-50/30 cursor-default opacity-40'
        }
      `}
    >
      {/* Subtle top highlight */}
      {status !== 'upcoming' && (
        <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      )}

      {/* Week number */}
      <div
        className={`
          w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold mb-3
          transition-all duration-300
          ${status === 'current'
            ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-[0_2px_8px_rgba(20,184,166,0.3)] group-hover:shadow-[0_4px_12px_rgba(20,184,166,0.4)]'
            : status === 'completed'
            ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600'
            : status === 'draft'
            ? 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600'
            : 'bg-stone-100 text-stone-300'
          }
        `}
      >
        {status === 'completed' ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          week
        )}
      </div>

      {/* Label */}
      <p className={`font-[family-name:var(--font-heading)] text-sm tracking-wide ${status === 'upcoming' ? 'text-stone-300' : 'text-stone-700'}`}>
        Week {week}
      </p>

      {/* Status badge */}
      <span
        className={`
          inline-flex items-center gap-1 mt-2.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider
          ${status === 'current'
            ? 'bg-teal-50 text-teal-600 shadow-[inset_0_0_0_1px_rgba(20,184,166,0.15)]'
            : status === 'completed'
            ? 'bg-emerald-50 text-emerald-600 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.15)]'
            : status === 'draft'
            ? 'bg-amber-50 text-amber-600 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.15)]'
            : 'bg-stone-100 text-stone-400'
          }
        `}
      >
        {status === 'current' && (
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
        )}
        {status === 'current' ? 'Current' : status === 'completed' ? 'Done' : status === 'draft' ? 'Draft' : 'Upcoming'}
      </span>
    </button>
  )
}
