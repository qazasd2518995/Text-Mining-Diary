-- ============================================
-- Learning Diary v3.0 — Database Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Groups table
CREATE TABLE IF NOT EXISTS groups (
  group_id INT PRIMARY KEY,
  composition_type TEXT NOT NULL CHECK (composition_type IN ('homogeneous_novice', 'heterogeneous_mixed'))
);

INSERT INTO groups (group_id, composition_type) VALUES
  (1, 'homogeneous_novice'),
  (2, 'homogeneous_novice'),
  (3, 'heterogeneous_mixed'),
  (4, 'heterogeneous_mixed'),
  (5, 'heterogeneous_mixed'),
  (6, 'heterogeneous_mixed')
ON CONFLICT (group_id) DO NOTHING;

-- 2. Students table
CREATE TABLE IF NOT EXISTS students (
  student_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  group_id INT REFERENCES groups(group_id),
  prior_experience INT CHECK (prior_experience BETWEEN 0 AND 3),
  perceived_composition TEXT CHECK (perceived_composition IN ('homogeneous', 'heterogeneous', 'unsure')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Diary entries table (all 35 questions in one row per student per week)
CREATE TABLE IF NOT EXISTS diary_entries (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(student_id),
  week_number INT NOT NULL CHECK (week_number BETWEEN 1 AND 18),

  -- Section A: Identification
  genai_tools JSONB DEFAULT '[]',
  conversation_log_url TEXT,

  -- Section B-1: Task Context
  q8_topics TEXT,
  q9_tasks TEXT,
  q10_difficulty SMALLINT CHECK (q10_difficulty BETWEEN 1 AND 5),

  -- Section B-2: Group Collaboration Dynamics
  q11a_scaffolding SMALLINT CHECK (q11a_scaffolding BETWEEN 1 AND 5),
  q11b_prompt_share SMALLINT CHECK (q11b_prompt_share BETWEEN 1 AND 5),
  q11c_prompt_adopt SMALLINT CHECK (q11c_prompt_adopt BETWEEN 1 AND 5),
  q11d_collective_eval SMALLINT CHECK (q11d_collective_eval BETWEEN 1 AND 5),
  q11e_role_differentiation SMALLINT CHECK (q11e_role_differentiation BETWEEN 1 AND 5),
  q12a_value_diversity SMALLINT CHECK (q12a_value_diversity BETWEEN 1 AND 5),
  q12b_upward_comparison SMALLINT CHECK (q12b_upward_comparison BETWEEN 1 AND 5),
  q12c_downward_comparison SMALLINT CHECK (q12c_downward_comparison BETWEEN 1 AND 5),
  q12d_equity SMALLINT CHECK (q12d_equity BETWEEN 1 AND 5),

  -- Section C-1: Prompt Strategy
  q13_prompt_types JSONB DEFAULT '[]',
  q14_prompt_sources JSONB DEFAULT '[]',

  -- Section C-2: Purpose of AI Use
  q15_purposes JSONB DEFAULT '[]',

  -- Section C-3: AI Response Quality
  q16_accuracy SMALLINT CHECK (q16_accuracy BETWEEN 1 AND 5),
  q16_clarity SMALLINT CHECK (q16_clarity BETWEEN 1 AND 5),
  q16_actionability SMALLINT CHECK (q16_actionability BETWEEN 1 AND 5),
  q16_trustworthiness SMALLINT CHECK (q16_trustworthiness BETWEEN 1 AND 5),
  q16_relevance SMALLINT CHECK (q16_relevance BETWEEN 1 AND 5),
  q17_quality_open TEXT,

  -- Section C-4: AI Dependency vs Learner Agency
  q18a_heavy_reliance SMALLINT CHECK (q18a_heavy_reliance BETWEEN 1 AND 5),
  q18b_self_first SMALLINT CHECK (q18b_self_first BETWEEN 1 AND 5),
  q18c_critical_eval SMALLINT CHECK (q18c_critical_eval BETWEEN 1 AND 5),
  q18d_cannot_without_ai SMALLINT CHECK (q18d_cannot_without_ai BETWEEN 1 AND 5),
  q18e_ai_starting_point SMALLINT CHECK (q18e_ai_starting_point BETWEEN 1 AND 5),
  q19a_peer_reduces_ai SMALLINT CHECK (q19a_peer_reduces_ai BETWEEN 1 AND 5),
  q19b_mutual_check SMALLINT CHECK (q19b_mutual_check BETWEEN 1 AND 5),

  -- Section D: Academic Emotions
  q20a_confidence SMALLINT CHECK (q20a_confidence BETWEEN 1 AND 5),
  q20b_curiosity SMALLINT CHECK (q20b_curiosity BETWEEN 1 AND 5),
  q20c_enjoyment SMALLINT CHECK (q20c_enjoyment BETWEEN 1 AND 5),
  q20d_pride SMALLINT CHECK (q20d_pride BETWEEN 1 AND 5),
  q21a_satisfaction SMALLINT CHECK (q21a_satisfaction BETWEEN 1 AND 5),
  q21b_relief SMALLINT CHECK (q21b_relief BETWEEN 1 AND 5),
  q22a_frustration SMALLINT CHECK (q22a_frustration BETWEEN 1 AND 5),
  q22b_anxiety SMALLINT CHECK (q22b_anxiety BETWEEN 1 AND 5),
  q22c_anger SMALLINT CHECK (q22c_anger BETWEEN 1 AND 5),
  q22d_shame SMALLINT CHECK (q22d_shame BETWEEN 1 AND 5),
  q23a_boredom SMALLINT CHECK (q23a_boredom BETWEEN 1 AND 5),
  q23b_hopelessness SMALLINT CHECK (q23b_hopelessness BETWEEN 1 AND 5),
  q24a_encouragement SMALLINT CHECK (q24a_encouragement BETWEEN 1 AND 5),
  q24b_inadequacy SMALLINT CHECK (q24b_inadequacy BETWEEN 1 AND 5),
  q24c_belonging SMALLINT CHECK (q24c_belonging BETWEEN 1 AND 5),
  q24d_observational_motivation SMALLINT CHECK (q24d_observational_motivation BETWEEN 1 AND 5),
  q24e_pace_pressure SMALLINT CHECK (q24e_pace_pressure BETWEEN 1 AND 5),
  q25_other_emotions TEXT,

  -- Section E: Metacognitive & Group Reflection
  q26_memorable_interaction TEXT,
  q27_prompt_revision TEXT,
  q28_improvement TEXT,
  q29_emotional_trajectory TEXT,
  q30_ai_literacy TEXT,
  q31_received_help TEXT,
  q32_gave_help TEXT,
  q33_composition_theorisation TEXT,

  -- Section F: Validity Check
  q34a_honesty SMALLINT CHECK (q34a_honesty BETWEEN 1 AND 5),
  q34b_comprehension SMALLINT CHECK (q34b_comprehension BETWEEN 1 AND 5),
  q35_attention_check SMALLINT CHECK (q35_attention_check BETWEEN 1 AND 5),

  -- Meta
  is_draft BOOLEAN DEFAULT true,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(student_id, week_number)
);

-- 4. Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (permissive for now — tighten after auth is set up)
CREATE POLICY "Anyone can read groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Anyone can read students" ON students FOR SELECT USING (true);
CREATE POLICY "Anyone can insert students" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update students" ON students FOR UPDATE USING (true);
CREATE POLICY "Anyone can read diary_entries" ON diary_entries FOR SELECT USING (true);
CREATE POLICY "Anyone can insert diary_entries" ON diary_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update diary_entries" ON diary_entries FOR UPDATE USING (true);

-- 6. Sample test student (remove in production)
INSERT INTO students (student_id, name, group_id) VALUES
  ('TEST001', 'Test Student', 1)
ON CONFLICT (student_id) DO NOTHING;
