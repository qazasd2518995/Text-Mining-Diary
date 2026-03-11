'use client'

interface CheckboxOption {
  value: string
  labelEn: string
  labelZh: string
}

interface CheckboxGroupProps {
  options: CheckboxOption[]
  value: string[]
  onChange: (v: string[]) => void
}

export default function CheckboxGroup({
  options,
  value,
  onChange,
}: CheckboxGroupProps) {
  const toggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  return (
    <div className="flex flex-wrap gap-2 sm:gap-2.5">
      {options.map((option) => {
        const checked = value.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggle(option.value)}
            className={`
              inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5
              rounded-xl border text-xs sm:text-sm
              transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:ring-offset-2 focus:ring-offset-stone-50
              ${
                checked
                  ? 'bg-gradient-to-br from-teal-500 to-teal-600 border-teal-400/30 text-white shadow-[0_2px_10px_rgba(20,184,166,0.25),inset_0_1px_0_rgba(255,255,255,0.12)] scale-[1.02]'
                  : 'bg-white/80 border-stone-200 text-stone-600 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] hover:border-teal-300 hover:text-teal-600 hover:shadow-[0_2px_8px_rgba(20,184,166,0.08)]'
              }
            `}
          >
            <span
              className={`
                inline-flex items-center justify-center w-4 h-4 rounded
                border transition-all duration-300
                ${
                  checked
                    ? 'bg-white/25 border-white/50'
                    : 'border-stone-300'
                }
              `}
            >
              {checked && (
                <svg className="w-3 h-3 animate-check-pop" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <span className="font-[family-name:var(--font-body)] font-medium tracking-wide">
              {option.labelEn}
            </span>
            <span className="text-[11px] opacity-60 font-light">
              {option.labelZh}
            </span>
          </button>
        )
      })}
    </div>
  )
}
