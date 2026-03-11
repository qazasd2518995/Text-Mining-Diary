'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getStoredStudent, type Student } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { sections, groupProfileQuestions, type Question, type Section } from '@/lib/questions'
import SectionNav from '@/components/SectionNav'
import QuestionRenderer from '@/components/QuestionRenderer'

type FormData = Record<string, unknown>

export default function DiaryEntryPage() {
  const router = useRouter()
  const params = useParams()
  const weekNumber = Number(params.week)

  const [student, setStudent] = useState<Student | null>(null)
  const [currentSection, setCurrentSection] = useState('A')
  const [formData, setFormData] = useState<FormData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [entryId, setEntryId] = useState<number | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const formDataRef = useRef<FormData>(formData)
  formDataRef.current = formData

  // Build sections with group profile questions for week 1
  const activeSections: Section[] = sections.map((section) => {
    if (section.id === 'A' && weekNumber === 1) {
      return {
        ...section,
        questions: [...groupProfileQuestions, ...section.questions],
      }
    }
    return section
  })

  const currentSectionData = activeSections.find((s) => s.id === currentSection)
  const sectionIndex = activeSections.findIndex((s) => s.id === currentSection)

  // Calculate progress
  const allQuestions = activeSections.flatMap((s) => s.questions)
  const answeredCount = allQuestions.filter((q) => {
    const val = formData[q.dbField]
    if (val === null || val === undefined || val === '') return false
    if (Array.isArray(val) && val.length === 0) return false
    return true
  }).length
  const progressPercent = Math.round((answeredCount / allQuestions.length) * 100)

  // Load existing entry
  const loadEntry = useCallback(async (studentId: string) => {
    const { data: rows } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('student_id', studentId)
      .eq('week_number', weekNumber)
      .limit(1)

    const data = rows?.[0]
    if (data) {
      setEntryId(data.id)
      const loaded: FormData = {}
      for (const section of sections) {
        for (const q of section.questions) {
          if (data[q.dbField] !== undefined && data[q.dbField] !== null) {
            loaded[q.dbField] = data[q.dbField]
          }
        }
      }
      // Also load group profile fields for week 1
      if (weekNumber === 1) {
        for (const q of groupProfileQuestions) {
          if (data[q.dbField] !== undefined && data[q.dbField] !== null) {
            loaded[q.dbField] = data[q.dbField]
          }
        }
      }
      setFormData(loaded)
    }
  }, [weekNumber])

  useEffect(() => {
    const stored = getStoredStudent()
    if (!stored) {
      router.replace('/')
      return
    }
    setStudent(stored)

    // Pre-fill group profile data from student record for week 1
    if (weekNumber === 1) {
      const preload: FormData = {}
      if (stored.prior_experience !== null) preload.prior_experience = String(stored.prior_experience)
      if (stored.group_id !== null) preload.group_id = String(stored.group_id)
      if (stored.perceived_composition) preload.perceived_composition = stored.perceived_composition
      setFormData(preload)
    }

    loadEntry(stored.student_id).finally(() => setLoading(false))
  }, [router, weekNumber, loadEntry])

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!student) return

    autoSaveRef.current = setInterval(() => {
      saveDraft(formDataRef.current, true)
    }, 30000)

    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student])

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setValidationErrors((prev) => prev.filter((f) => f !== field))
  }

  const buildUpsertPayload = (data: FormData, isDraft: boolean) => {
    const payload: Record<string, unknown> = {
      student_id: student!.student_id,
      week_number: weekNumber,
      is_draft: isDraft,
      updated_at: new Date().toISOString(),
    }

    if (!isDraft) {
      payload.submitted_at = new Date().toISOString()
    }

    // Map all section questions
    for (const section of sections) {
      for (const q of section.questions) {
        if (data[q.dbField] !== undefined) {
          payload[q.dbField] = data[q.dbField]
        }
      }
    }

    // Group profile fields stored in diary_entries are not in the schema
    // They are stored in students table, but include them if columns exist
    // Actually, Q5-Q7 are stored in students table, not diary_entries

    if (entryId) {
      payload.id = entryId
    }

    return payload
  }

  const saveDraft = async (data: FormData, silent = false) => {
    if (!student) return
    if (!silent) setSaving(true)

    try {
      const payload = buildUpsertPayload(data, true)
      const { data: result, error } = await supabase
        .from('diary_entries')
        .upsert(payload, { onConflict: 'student_id,week_number' })
        .select('id')
        .single()

      if (!error && result) {
        setEntryId(result.id)
        setLastSaved(new Date())
      }
    } catch {
      // Silent fail for auto-save
    } finally {
      if (!silent) setSaving(false)
    }
  }

  const validate = (): string[] => {
    const errors: string[] = []
    for (const section of activeSections) {
      for (const q of section.questions) {
        if (!q.required) continue
        const val = formData[q.dbField]
        if (val === null || val === undefined || val === '') {
          errors.push(q.dbField)
        }
        if (Array.isArray(val) && val.length === 0) {
          errors.push(q.dbField)
        }
      }
    }
    return errors
  }

  const handleSubmit = async () => {
    const errors = validate()
    if (errors.length > 0) {
      setValidationErrors(errors)
      // Navigate to section containing first error
      for (const section of activeSections) {
        const hasError = section.questions.some((q) => errors.includes(q.dbField))
        if (hasError) {
          setCurrentSection(section.id)
          break
        }
      }
      return
    }

    setSubmitting(true)
    try {
      const payload = buildUpsertPayload(formData, false)
      const { error } = await supabase
        .from('diary_entries')
        .upsert(payload, { onConflict: 'student_id,week_number' })

      if (error) {
        alert('Failed to submit. Please try again.')
        return
      }

      // Week 1: update students table with Q5-Q7 values
      if (weekNumber === 1 && student) {
        const studentUpdate: Record<string, unknown> = {}
        if (formData.prior_experience !== undefined) {
          studentUpdate.prior_experience = Number(formData.prior_experience)
        }
        if (formData.group_id !== undefined) {
          studentUpdate.group_id = Number(formData.group_id)
        }
        if (formData.perceived_composition !== undefined) {
          studentUpdate.perceived_composition = formData.perceived_composition
        }

        if (Object.keys(studentUpdate).length > 0) {
          await supabase
            .from('students')
            .update(studentUpdate)
            .eq('student_id', student.student_id)
        }
      }

      router.push('/dashboard')
    } catch {
      alert('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-36">
      {/* Header with warm gradient */}
      <header className="relative border-b border-stone-200/50 bg-gradient-to-r from-stone-50 via-white to-stone-50 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/20 to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2.5 text-sm text-stone-400 hover:text-stone-700 transition-all duration-300 group"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-stone-100 group-hover:bg-stone-200 transition-colors duration-300">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </span>
            <span className="font-[family-name:var(--font-heading)] tracking-wide">Dashboard</span>
          </button>
          <div className="text-right">
            <p className="text-xs text-stone-500 font-medium tracking-wide">{student.name}</p>
            {lastSaved && (
              <p className="text-[10px] text-stone-300 mt-0.5 tracking-wider uppercase">
                Saved {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Section Nav */}
      <SectionNav
        sections={activeSections.map((s) => ({ id: s.id, titleEn: s.titleEn, titleZh: s.titleZh }))}
        currentSection={currentSection}
        onSelect={setCurrentSection}
      />

      {/* Title area with decorative accent */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-5">
        <div className="relative">
          {/* Decorative accent line */}
          <div className="absolute -left-2 top-1 bottom-1 w-1 rounded-full bg-gradient-to-b from-teal-400 via-teal-500 to-teal-300 opacity-70" />
          <div className="pl-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-teal-600/70 font-medium mb-1.5">
              Week {weekNumber}
            </p>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl text-stone-800 tracking-tight">
              Learning Diary
            </h1>
            <p className="text-stone-400 text-sm mt-1 italic">
              第 {weekNumber} 週學習日誌
            </p>
          </div>
        </div>

        {/* Elegant progress bar */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-[3px] bg-stone-200/60 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 transition-all duration-700 ease-out animate-progress-glow"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-stone-400 font-medium tabular-nums tracking-wider min-w-[3ch] text-right">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Current Section Content */}
      {currentSectionData && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 animate-section-slide-in" key={currentSection}>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-200/40 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] p-6 sm:p-10 mt-4">
            {/* Section header */}
            <div className="mb-8 pb-5 border-b border-stone-100/80">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white text-xs font-bold shadow-sm">
                  {currentSectionData.id}
                </span>
                <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl text-stone-800 tracking-tight">
                  {currentSectionData.titleEn}
                </h2>
              </div>
              <p className="text-sm text-stone-400 ml-11 italic">{currentSectionData.titleZh}</p>
              {currentSectionData.instructionEn && (
                <div className="ml-11 mt-4 pl-4 border-l-2 border-teal-100">
                  <p className="text-sm text-stone-500 leading-relaxed">
                    {currentSectionData.instructionEn}
                  </p>
                  {currentSectionData.instructionZh && (
                    <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                      {currentSectionData.instructionZh}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Questions */}
            <div className="space-y-1">
              {currentSectionData.questions.map((question: Question) => (
                <div
                  key={question.id}
                  className={`
                    rounded-xl transition-all duration-300
                    ${validationErrors.includes(question.dbField)
                      ? 'ring-1 ring-red-200/80 bg-red-50/30 -mx-3 px-3'
                      : ''
                    }
                  `}
                >
                  <QuestionRenderer
                    question={question}
                    value={formData[question.dbField]}
                    otherValue={question.otherDbField ? (formData[question.otherDbField] as string) : undefined}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={() => {
                if (sectionIndex > 0) {
                  setCurrentSection(activeSections[sectionIndex - 1].id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
              disabled={sectionIndex === 0}
              className="flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium text-stone-400 hover:text-stone-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 rounded-xl hover:bg-white/80 hover:shadow-sm group"
            >
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-[family-name:var(--font-heading)] tracking-wide">Previous</span>
            </button>

            {sectionIndex < activeSections.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  setCurrentSection(activeSections[sectionIndex + 1].id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-all duration-300 rounded-xl hover:bg-teal-50/80 hover:shadow-sm group"
              >
                <span className="font-[family-name:var(--font-heading)] tracking-wide">Next</span>
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      )}

      {/* Validation errors summary */}
      {validationErrors.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-6">
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-100/60 rounded-xl px-5 py-4 text-sm text-red-600 shadow-sm">
            <span className="font-medium">Please fill in all required fields</span>
            <span className="text-red-400 ml-1">({validationErrors.length} remaining)</span>
          </div>
        </div>
      )}

      {/* Bottom action bar with glass-morphism */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/90 to-white/70 backdrop-blur-xl border-t border-stone-200/30" />
        <div className="relative max-w-3xl mx-auto px-3 sm:px-6 py-3 sm:py-5 flex items-center justify-between gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-2 sm:px-5 py-2.5 text-xs sm:text-sm font-medium text-stone-400 hover:text-stone-600 transition-all duration-200 flex items-center gap-1 sm:gap-1.5 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => saveDraft(formData)}
            disabled={saving}
            className="px-3 sm:px-6 py-2.5 text-xs sm:text-sm font-medium text-stone-500 bg-white/80 border border-stone-200/60 hover:bg-white hover:border-stone-300 hover:shadow-sm rounded-xl transition-all duration-300 disabled:opacity-50 backdrop-blur-sm whitespace-nowrap"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 sm:px-8 py-2.5 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-[0_2px_8px_rgba(20,184,166,0.25)] hover:shadow-[0_4px_16px_rgba(20,184,166,0.35)] focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 whitespace-nowrap"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="hidden sm:inline">Submitting...</span>
                <span className="sm:hidden">...</span>
              </span>
            ) : (
              <span className="font-[family-name:var(--font-heading)] tracking-wider">Submit</span>
            )}
          </button>
          </div>
        </div>
      </div>
    </div>
  )
}
