'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredStudent, logout } from '@/lib/auth'
import type { Student } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import WeekCard from '@/components/WeekCard'

const TOTAL_WEEKS = 18

// Semester starts on the week of Mar 25, 2026 (Wednesday)
const SEMESTER_START = new Date('2026-03-25')

function getCurrentWeek(): number {
  const now = new Date()
  const diff = now.getTime() - SEMESTER_START.getTime()
  if (diff < 0) return 0
  const weekNum = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1
  return Math.min(weekNum, TOTAL_WEEKS)
}

type WeekStatus = 'completed' | 'draft' | 'current' | 'upcoming'

export default function DashboardPage() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [weekStatuses, setWeekStatuses] = useState<Record<number, WeekStatus>>({})
  const [loading, setLoading] = useState(true)

  const currentWeek = getCurrentWeek()

  const fetchEntries = useCallback(async (studentId: string) => {
    const { data } = await supabase
      .from('diary_entries')
      .select('week_number, is_draft')
      .eq('student_id', studentId)

    const statuses: Record<number, WeekStatus> = {}
    for (let w = 1; w <= TOTAL_WEEKS; w++) {
      const entry = data?.find((e: { week_number: number; is_draft: boolean }) => e.week_number === w)
      if (entry) {
        statuses[w] = entry.is_draft ? 'draft' : 'completed'
      } else if (w === currentWeek && currentWeek > 0) {
        statuses[w] = 'current'
      } else if (w < currentWeek && currentWeek > 0) {
        statuses[w] = 'current' // past weeks still open for late submission
      } else {
        statuses[w] = 'upcoming'
      }
    }
    setWeekStatuses(statuses)
  }, [currentWeek])

  useEffect(() => {
    const stored = getStoredStudent()
    if (!stored) {
      router.replace('/')
      return
    }
    setStudent(stored)
    fetchEntries(stored.student_id).finally(() => setLoading(false))

    // Refetch when user returns to this tab/page
    const handleFocus = () => {
      if (stored) fetchEntries(stored.student_id)
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [router, fetchEntries])

  const handleLogout = () => {
    logout()
    router.replace('/')
  }

  if (loading || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const completedCount = Object.values(weekStatuses).filter(s => s === 'completed').length
  const draftCount = Object.values(weekStatuses).filter(s => s === 'draft').length
  const progressPercent = Math.round(((completedCount + draftCount * 0.5) / TOTAL_WEEKS) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-50 to-teal-50/20 relative overflow-hidden">

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        .dash-stagger-1 { animation: fadeInUp 0.6s ease-out 0.05s both; }
        .dash-stagger-2 { animation: fadeInUp 0.6s ease-out 0.15s both; }
        .dash-stagger-3 { animation: fadeInUp 0.6s ease-out 0.25s both; }
        .dash-stagger-4 { animation: fadeIn 0.5s ease-out 0.8s both; }
      `}</style>

      {/* ── Decorative background elements ── */}
      <div className="pointer-events-none absolute top-32 right-[-40px] w-64 h-64 rounded-full border border-stone-200/30" />
      <div className="pointer-events-none absolute top-40 right-[-20px] w-40 h-40 rounded-full border border-teal-200/20" />
      <div className="pointer-events-none absolute bottom-20 left-[-30px] w-48 h-48 rounded-full border border-stone-200/20" />
      {/* Floating dots */}
      <div className="pointer-events-none absolute top-[45%] right-[6%] w-1.5 h-1.5 rounded-full bg-teal-400/15" />
      <div className="pointer-events-none absolute top-[70%] left-[5%] w-2 h-2 rounded-full bg-stone-300/20" />
      <div className="pointer-events-none absolute top-[20%] left-[10%] w-1 h-1 rounded-full bg-teal-300/20" />
      {/* Thin decorative lines top-left */}
      <div className="pointer-events-none absolute top-48 left-6 opacity-[0.06]">
        <div className="w-16 h-px bg-teal-600 mb-2" />
        <div className="w-10 h-px bg-teal-600" />
      </div>

      {/* ── Progress bar at very top ── */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-stone-100/60 z-30">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ── Top bar / header ── */}
      <header className="border-b border-stone-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-20 dash-stagger-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Avatar with ring accent */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                {student.name.charAt(0)}
              </div>
              <div className="absolute -inset-[3px] rounded-full border-2 border-teal-400/20" />
              {/* Online-style dot */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-800 tracking-wide">{student.name}</p>
              <p className="text-xs text-stone-400 tracking-wider">{student.student_id}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-stone-400 hover:text-stone-600 transition-all duration-200 px-4 py-2 rounded-xl hover:bg-stone-100/80 tracking-wide"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        {/* Title area */}
        <div className="mb-12 dash-stagger-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-teal-500/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-teal-500/30" />
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-5xl text-stone-800 mb-2 tracking-tight">
            Your Learning Diary
          </h1>
          <p className="text-stone-400 text-sm tracking-wider mb-5">
            你的學習日誌
          </p>
          <div className="flex items-center gap-3">
            {currentWeek > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-teal-50/80 text-teal-700 text-xs font-medium border border-teal-100/80 tracking-wide shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                Current: Week {currentWeek}
              </span>
            ) : (
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-amber-50/80 text-amber-700 text-xs font-medium border border-amber-100/80 tracking-wide shadow-sm">
                Semester starts 3/18 / 學期 3/18 開始
              </span>
            )}
            <span className="text-xs text-stone-400">
              {completedCount} of {TOTAL_WEEKS} completed
            </span>
          </div>
        </div>

        {/* ── Week grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4 dash-stagger-3">
          {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((week) => (
            <div
              key={week}
              style={{ animationDelay: `${0.3 + week * 0.04}s` }}
              className="animate-[fadeInUp_0.5s_ease-out_both]"
            >
              <WeekCard
                week={week}
                status={weekStatuses[week] || 'upcoming'}
                onClick={() => router.push(`/diary/${week}`)}
              />
            </div>
          ))}
        </div>

        {/* ── Legend ── */}
        <div className="mt-10 pt-6 border-t border-stone-200/40 dash-stagger-4">
          <div className="flex flex-wrap items-center gap-5 text-xs text-stone-400 tracking-wide">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-600 shadow-sm shadow-teal-600/20" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-200 border border-emerald-300" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-200 border border-amber-300" />
              <span>Draft</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-stone-100 border border-stone-200" />
              <span>Upcoming</span>
            </div>
          </div>
        </div>

        {/* ── Bottom decorative element ── */}
        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-2">
            <div className="w-5 h-px bg-stone-300/40" />
            <div className="w-1 h-1 rounded-full bg-stone-300/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500/40" />
            <div className="w-1 h-1 rounded-full bg-stone-300/50" />
            <div className="w-5 h-px bg-stone-300/40" />
          </div>
        </div>
      </main>
    </div>
  )
}
