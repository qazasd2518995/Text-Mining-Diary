'use client'

import { useRef, useEffect, useCallback } from 'react'

interface OpenEndedFieldProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  minRows?: number
}

export default function OpenEndedField({
  value,
  onChange,
  placeholder = 'Type your response here...',
  minRows = 3,
}: OpenEndedFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const lineHeight = 24
    const minHeight = lineHeight * minRows
    el.style.height = `${Math.max(minHeight, el.scrollHeight)}px`
  }, [minRows])

  useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])

  return (
    <div className="relative group">
      {/* Subtle left accent line */}
      <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-gradient-to-b from-teal-300/0 via-teal-300/40 to-teal-300/0 group-focus-within:via-teal-400/60 transition-all duration-500" />
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={minRows}
        className="
          w-full resize-none overflow-hidden
          bg-transparent
          border-0 border-b-2 border-stone-200/50
          pl-4 pr-1 py-3
          text-stone-800 placeholder-stone-300/70
          font-[family-name:var(--font-body)] text-base leading-7
          transition-all duration-300
          focus:outline-none focus:border-teal-400/70
          hover:border-stone-300/70
        "
      />
    </div>
  )
}
