'use client'

import { useState } from 'react'
import type { Question } from '@/lib/questions'
import LikertScale from './LikertScale'
import CheckboxGroup from './CheckboxGroup'
import OpenEndedField from './OpenEndedField'

interface QuestionRendererProps {
  question: Question
  value: any
  otherValue?: string
  onChange: (field: string, value: any) => void
}

export default function QuestionRenderer({
  question,
  value,
  otherValue: externalOtherValue,
  onChange,
}: QuestionRendererProps) {
  const [otherValue, setOtherValue] = useState(externalOtherValue || '')
  const handleChange = (v: any) => onChange(question.dbField, v)

  const renderInput = () => {
    switch (question.type) {
      case 'likert':
        return (
          <LikertScale
            name={question.dbField}
            value={value ?? null}
            onChange={handleChange}
            labels={question.likertLabels}
          />
        )

      case 'checkbox':
        return (
          <div className="space-y-4">
            <CheckboxGroup
              options={question.options ?? []}
              value={value ?? []}
              onChange={handleChange}
            />
            {question.hasOtherField && (
              <div className="flex items-center gap-2 sm:gap-3 pl-1 pt-1">
                <span className="text-xs sm:text-sm text-stone-400 shrink-0 italic tracking-wide">Other / 其他:</span>
                <input
                  type="text"
                  value={otherValue}
                  onChange={(e) => {
                    setOtherValue(e.target.value)
                    if (question.otherDbField) {
                      onChange(question.otherDbField, e.target.value)
                    }
                  }}
                  className="flex-1 bg-transparent border-0 border-b border-stone-200/60 px-1 py-1.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-teal-400 transition-all duration-300 hover:border-stone-300"
                  placeholder="Please specify..."
                />
              </div>
            )}
          </div>
        )

      case 'textarea':
        return (
          <OpenEndedField
            value={value ?? ''}
            onChange={handleChange}
            minRows={3}
          />
        )

      case 'text':
        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            className="
              w-full bg-transparent border-0 border-b-2 border-stone-200/60
              px-1 py-3 text-stone-800 placeholder-stone-300
              font-[family-name:var(--font-body)] text-base
              transition-all duration-300
              focus:outline-none focus:border-teal-400
              hover:border-stone-300
            "
          />
        )

      case 'url':
        return (
          <input
            type="url"
            value={value ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="https://"
            className="
              w-full bg-transparent border-0 border-b-2 border-stone-200/60
              px-1 py-3 text-stone-800 placeholder-stone-300
              font-[family-name:var(--font-body)] text-base font-mono
              transition-all duration-300
              focus:outline-none focus:border-teal-400
              hover:border-stone-300
            "
          />
        )

      case 'radio':
        return (
          <div className="space-y-2.5">
            {(question.options ?? []).map((option) => (
              <label
                key={option.value}
                className={`
                  flex items-start sm:items-center gap-2.5 sm:gap-3.5 px-3.5 sm:px-5 py-3 sm:py-3.5
                  rounded-xl border cursor-pointer
                  transition-all duration-300
                  ${
                    value === option.value
                      ? 'bg-gradient-to-r from-teal-50/80 to-teal-50/30 border-teal-200 text-teal-800 shadow-[inset_0_0_0_1px_rgba(20,184,166,0.08)]'
                      : 'bg-white/60 border-stone-200/60 text-stone-600 hover:border-teal-200 hover:bg-teal-50/20'
                  }
                `}
              >
                <div
                  className={`
                    w-[18px] h-[18px] shrink-0 rounded-full border-2 flex items-center justify-center
                    transition-all duration-300
                    ${
                      value === option.value
                        ? 'border-teal-500'
                        : 'border-stone-300'
                    }
                  `}
                >
                  {value === option.value && (
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 animate-check-pop" />
                  )}
                </div>
                <input
                  type="radio"
                  name={question.dbField}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleChange(option.value)}
                  className="sr-only"
                />
                <div className="font-[family-name:var(--font-body)] min-w-0">
                  <span className="text-xs sm:text-sm font-medium">{option.labelEn}</span>
                  <span className="text-[10px] sm:text-[11px] text-stone-400 ml-1.5 sm:ml-2 italic">{option.labelZh}</span>
                </div>
              </label>
            ))}
          </div>
        )

      case 'dropdown':
        return (
          <div className="relative">
            <select
              value={value ?? ''}
              onChange={(e) => handleChange(e.target.value)}
              className="
                w-full bg-white/80 border-2 border-stone-200/60 rounded-xl
                px-4 py-3.5 text-stone-800
                font-[family-name:var(--font-body)] text-sm
                transition-all duration-300
                focus:outline-none focus:border-teal-400 focus:shadow-[0_0_0_3px_rgba(20,184,166,0.08)]
                hover:border-stone-300
                appearance-none cursor-pointer
              "
            >
              <option value="">Select...</option>
              {(question.options ?? []).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.labelEn} {option.labelZh}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div
      className={`
        py-6 space-y-4
        ${question.isGroupItem
          ? 'pl-5 border-l-2 border-transparent bg-gradient-to-r from-teal-50/40 to-transparent rounded-r-xl ml-1 [border-image:linear-gradient(to_bottom,rgb(20_184_166/0.15),rgb(20_184_166/0.4),rgb(20_184_166/0.15))_1]'
          : ''
        }
      `}
    >
      {/* Question header */}
      <div className="flex items-start gap-3.5">
        <span
          className="
            inline-flex items-center justify-center
            min-w-[30px] h-7 px-2
            rounded-full bg-gradient-to-br from-stone-100 to-stone-200/60 text-stone-500
            text-[11px] font-bold font-[family-name:var(--font-body)]
            tracking-wider shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]
          "
        >
          {question.id}
        </span>
        <div className="flex-1 pt-0.5">
          <p className="text-stone-800 text-[15px] leading-relaxed font-[family-name:var(--font-body)] font-medium">
            {question.labelEn}
            {question.required && (
              <span className="text-red-400/80 ml-1 text-xs">*</span>
            )}
          </p>
          <p className="text-stone-400 text-[13px] mt-1 italic leading-relaxed">
            {question.labelZh}
          </p>
        </div>
      </div>

      {/* Input area */}
      <div className="ml-0 sm:ml-[46px]">
        {renderInput()}
      </div>
    </div>
  )
}
