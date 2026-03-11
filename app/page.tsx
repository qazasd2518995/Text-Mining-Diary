'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginOrRegister, getStoredStudent, storeStudent } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [studentId, setStudentId] = useState('')
  const [name, setName] = useState('')
  const [showNameField, setShowNameField] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const stored = getStoredStudent()
    if (stored) {
      router.replace('/dashboard')
    } else {
      setCheckingAuth(false)
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await loginOrRegister(studentId, showNameField ? name : undefined)

      if (result.error === 'NEW_STUDENT') {
        // First time — show name field for registration
        setShowNameField(true)
        setLoading(false)
        return
      }

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      if (result.student) {
        storeStudent(result.student)
        router.push('/dashboard')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-stone-50 via-stone-50 to-teal-50/30 relative overflow-hidden">

      {/* ── Animated gradient orb ── */}
      <div
        className="pointer-events-none absolute w-[520px] h-[520px] rounded-full opacity-[0.12] blur-3xl"
        style={{
          background: 'radial-gradient(circle, #0d9488 0%, #99f6e4 40%, transparent 70%)',
          animation: 'orbFloat 14s ease-in-out infinite',
        }}
      />
      {/* Secondary smaller orb */}
      <div
        className="pointer-events-none absolute w-[280px] h-[280px] rounded-full opacity-[0.08] blur-2xl"
        style={{
          background: 'radial-gradient(circle, #f5f5f4 0%, #0d9488 60%, transparent 80%)',
          animation: 'orbFloat2 18s ease-in-out infinite',
        }}
      />

      {/* ── Decorative geometric elements ── */}
      {/* Top-left thin lines */}
      <div className="pointer-events-none absolute top-16 left-12 opacity-[0.08]">
        <div className="w-24 h-px bg-teal-600 mb-3" />
        <div className="w-16 h-px bg-teal-600 mb-3" />
        <div className="w-10 h-px bg-teal-600" />
      </div>
      {/* Bottom-right circle */}
      <div className="pointer-events-none absolute bottom-20 right-16 w-20 h-20 rounded-full border border-stone-200/40" />
      <div className="pointer-events-none absolute bottom-24 right-20 w-10 h-10 rounded-full border border-teal-300/20" />
      {/* Top-right diamond */}
      <div className="pointer-events-none absolute top-24 right-24 w-3 h-3 rotate-45 bg-teal-500/15" />
      {/* Scattered dots */}
      <div className="pointer-events-none absolute top-1/3 left-[8%] w-1.5 h-1.5 rounded-full bg-teal-400/20" />
      <div className="pointer-events-none absolute top-[60%] right-[12%] w-1 h-1 rounded-full bg-stone-400/20" />
      <div className="pointer-events-none absolute bottom-[30%] left-[15%] w-2 h-2 rounded-full border border-stone-300/30" />

      {/* ── Keyframes injected via style tag ── */}
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translate(-60%, -40%) scale(1); }
          33% { transform: translate(-45%, -55%) scale(1.08); }
          66% { transform: translate(-70%, -35%) scale(0.95); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(120%, 80%) scale(1); }
          50% { transform: translate(100%, 60%) scale(1.12); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .anim-stagger-1 { animation: fadeInUp 0.7s ease-out 0.1s both; }
        .anim-stagger-2 { animation: fadeInUp 0.7s ease-out 0.2s both; }
        .anim-stagger-3 { animation: fadeInUp 0.7s ease-out 0.35s both; }
        .anim-stagger-4 { animation: fadeInUp 0.7s ease-out 0.5s both; }
        .anim-stagger-5 { animation: fadeInUp 0.7s ease-out 0.65s both; }
      `}</style>

      <div className="w-full max-w-md relative z-10">
        {/* ── Decorative teal accent line + diamond ── */}
        <div className="flex items-center justify-center gap-3 mb-10 anim-stagger-1">
          <div className="w-10 h-px bg-stone-300/60" />
          <div className="w-2 h-2 rotate-45 border border-teal-500/50" />
          <div className="w-10 h-px bg-stone-300/60" />
        </div>

        {/* ── Card ── */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04),0_12px_40px_rgba(0,0,0,0.06)] border border-stone-200/50 p-6 sm:p-12 relative overflow-hidden">

          {/* Subtle top accent stripe */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />

          {/* Title */}
          <div className="text-center mb-10 anim-stagger-1">
            <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-5xl text-stone-800 mb-3 tracking-tight">
              Learning Diary
            </h1>
            <div className="flex items-center justify-center gap-2.5 mb-4">
              <div className="w-6 h-px bg-teal-500/40" />
              <div className="w-1 h-1 rounded-full bg-teal-500/50" />
              <div className="w-6 h-px bg-teal-500/40" />
            </div>
            <p className="text-stone-500 text-sm leading-relaxed tracking-wide">
              Weekly Reflection on GenAI-Assisted Learning
            </p>
            <p className="text-stone-400 text-xs mt-1.5 tracking-wider">
              每週 GenAI 輔助學習反思日誌
            </p>
          </div>

          {/* Thin separator */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-stone-200/80 to-transparent mb-9 anim-stagger-2" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 anim-stagger-3">
            <div className="relative">
              <label htmlFor="studentId" className="block text-xs font-medium text-stone-500 uppercase tracking-widest mb-2.5">
                Student ID / 學號
              </label>
              <input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value)
                  setError('')
                  if (!showNameField) setShowNameField(false)
                }}
                placeholder="e.g. A11317005"
                className="w-full px-5 py-3.5 bg-stone-50/80 border border-stone-200/80 rounded-2xl text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:bg-white transition-all duration-300 text-[15px]"
                autoComplete="off"
                autoFocus
                disabled={showNameField}
              />
              <p className="text-[11px] text-stone-400 mt-2 tracking-wide">不分大小寫 / Case-insensitive</p>
            </div>

            {showNameField && (
              <div className="animate-[fadeIn_0.3s_ease-out]">
                <div className="bg-teal-50/60 border border-teal-100/60 rounded-2xl px-5 py-4 mb-5">
                  <p className="text-sm text-teal-700">
                    First time? Please enter your name to register.
                  </p>
                  <p className="text-xs text-teal-600/70 mt-1">
                    第一次使用？請輸入姓名完成註冊。
                  </p>
                </div>
                <label htmlFor="name" className="block text-xs font-medium text-stone-500 uppercase tracking-widest mb-2.5">
                  Name / 姓名
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setError('')
                  }}
                  placeholder="e.g. 王小明"
                  className="w-full px-5 py-3.5 bg-stone-50/80 border border-stone-200/80 rounded-2xl text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:bg-white transition-all duration-300 text-[15px]"
                  autoFocus
                />
              </div>
            )}

            {error && error !== 'NEW_STUDENT' && (
              <div className="text-sm text-red-500 bg-red-50/80 border border-red-100 rounded-2xl px-5 py-3.5">
                {error}
              </div>
            )}

            <div className="anim-stagger-4 pt-1">
              <button
                type="submit"
                disabled={loading || !studentId.trim() || (showNameField && !name.trim())}
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/10 disabled:bg-stone-300 disabled:cursor-not-allowed disabled:shadow-none text-white font-medium rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-white tracking-wide text-[15px]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {showNameField ? 'Registering...' : 'Signing in...'}
                  </span>
                ) : showNameField ? (
                  'Register & Sign In / 註冊並登入'
                ) : (
                  'Sign In / 登入'
                )}
              </button>
            </div>

            {showNameField && (
              <button
                type="button"
                onClick={() => {
                  setShowNameField(false)
                  setName('')
                  setStudentId('')
                  setError('')
                }}
                className="w-full text-sm text-stone-400 hover:text-stone-600 transition-colors duration-200"
              >
                ← Back / 返回
              </button>
            )}
          </form>
        </div>

        {/* ── Bottom decorative element ── */}
        <div className="flex justify-center mt-8 anim-stagger-5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-px bg-stone-300/50" />
            <div className="w-1 h-1 rounded-full bg-stone-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500/60" />
            <div className="w-1 h-1 rounded-full bg-stone-300" />
            <div className="w-5 h-px bg-stone-300/50" />
          </div>
        </div>
      </div>
    </div>
  )
}
