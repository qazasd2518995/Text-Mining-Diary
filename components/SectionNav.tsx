'use client'

interface SectionNavProps {
  sections: { id: string; titleEn: string; titleZh: string }[]
  currentSection: string
  onSelect: (id: string) => void
  completedSections?: string[]
}

export default function SectionNav({
  sections,
  currentSection,
  onSelect,
  completedSections = [],
}: SectionNavProps) {
  return (
    <nav className="sticky top-0 z-30 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/40 py-3 sm:py-5 px-2 sm:px-4">
      <div className="max-w-3xl mx-auto overflow-x-auto scrollbar-hide">
        <div className="flex items-center justify-between relative min-w-0 gap-1 sm:gap-0">
          {/* Gradient connecting line */}
          <div className="absolute top-1/2 left-4 right-4 h-[2px] -translate-y-1/2 z-0">
            <div className="w-full h-full bg-gradient-to-r from-stone-200/40 via-stone-200 to-stone-200/40 rounded-full" />
          </div>

          {sections.map((section, i) => {
            const isCurrent = section.id === currentSection
            const isCompleted = completedSections.includes(section.id)

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSelect(section.id)}
                className="relative z-10 flex flex-col items-center gap-2 group focus:outline-none"
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div
                  className={`
                    relative flex items-center justify-center
                    w-8 h-8 sm:w-10 sm:h-10 rounded-full
                    text-sm font-semibold
                    transition-all duration-300 ease-out
                    ${
                      isCurrent
                        ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-[0_2px_10px_rgba(20,184,166,0.3)] scale-110'
                        : isCompleted
                        ? 'bg-teal-50 text-teal-600 border-2 border-teal-200 shadow-sm'
                        : 'bg-white text-stone-400 border-2 border-stone-200 group-hover:border-teal-300 group-hover:text-teal-500 shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)]'
                    }
                  `}
                >
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full animate-pulse-glow" />
                  )}
                  {isCompleted && !isCurrent ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="relative z-10">{section.id}</span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col items-center">
                  <span
                    className={`
                      text-[11px] font-semibold leading-tight text-center tracking-wide
                      font-[family-name:var(--font-body)]
                      transition-colors duration-300
                      ${isCurrent ? 'text-teal-700' : 'text-stone-400 group-hover:text-stone-500'}
                    `}
                  >
                    {section.titleEn}
                  </span>
                  <span
                    className={`
                      text-[10px] leading-tight text-center mt-0.5 italic
                      transition-colors duration-300
                      ${isCurrent ? 'text-teal-500/70' : 'text-stone-300 group-hover:text-stone-400'}
                    `}
                  >
                    {section.titleZh}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
