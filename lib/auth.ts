import { supabase } from './supabase'

export interface Student {
  student_id: string
  name: string
  group_id: number | null
  prior_experience: number | null
  perceived_composition: string | null
}

export async function loginOrRegister(studentId: string, name?: string): Promise<{ student: Student | null; isNew: boolean; error?: string }> {
  const normalizedId = studentId.trim().toUpperCase()

  // Try to find existing student (case-insensitive via uppercase normalization)
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('student_id', normalizedId)
    .maybeSingle()

  if (error) return { student: null, isNew: false, error: 'Connection error. Please try again.' }

  // Found existing student — login
  if (data) {
    return { student: data as Student, isNew: false }
  }

  // Not found — need to register
  if (!name || !name.trim()) {
    return { student: null, isNew: true, error: 'NEW_STUDENT' }
  }

  // Create new student
  const { data: newStudent, error: insertError } = await supabase
    .from('students')
    .insert({ student_id: normalizedId, name: name.trim() })
    .select()
    .single()

  if (insertError) return { student: null, isNew: true, error: 'Registration failed. Please try again.' }

  return { student: newStudent as Student, isNew: true }
}

export function getStoredStudent(): Student | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem('learning_diary_student')
  if (!stored) return null
  try {
    return JSON.parse(stored) as Student
  } catch {
    return null
  }
}

export function storeStudent(student: Student) {
  localStorage.setItem('learning_diary_student', JSON.stringify(student))
}

export function logout() {
  localStorage.removeItem('learning_diary_student')
}
