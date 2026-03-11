-- ============================================
-- Export View: diary_entries_export
-- Columns ordered by question number (Q3–Q33)
-- JSONB fields expanded to boolean columns
-- Run in Supabase Dashboard → SQL Editor
-- ============================================

CREATE OR REPLACE VIEW diary_entries_export AS
SELECT
  -- Meta
  d.id,
  d.student_id,
  s.name AS student_name,
  s.group_id,
  s.prior_experience,
  s.perceived_composition,
  d.week_number,
  d.is_draft,
  d.submitted_at,
  d.created_at,
  d.updated_at,

  -- Section A: Q3 GenAI Tools (JSONB → boolean columns)
  d.genai_tools @> '"ChatGPT"' AS q3_chatgpt,
  d.genai_tools @> '"Claude"' AS q3_claude,
  d.genai_tools @> '"Gemini"' AS q3_gemini,
  d.genai_tools @> '"Copilot"' AS q3_copilot,
  d.genai_tools @> '"Other"' AS q3_other,
  d.genai_tools_other AS q3_other_text,

  -- Q4
  d.conversation_log_url AS q4_conversation_log_url,

  -- Section B-1: Q8–Q10
  d.q8_topics,
  d.q9_tasks,
  d.q10_difficulty,

  -- Section B-2: Q11–Q12 (Likert)
  d.q11a_scaffolding,
  d.q11b_prompt_share,
  d.q11c_prompt_adopt,
  d.q11d_collective_eval,
  d.q11e_role_differentiation,
  d.q12a_value_diversity,
  d.q12b_upward_comparison,
  d.q12c_downward_comparison,
  d.q12d_equity,

  -- Section C-1: Q13 Prompt Types (JSONB → boolean columns)
  d.q13_prompt_types @> '"initial_query"' AS q13_initial_query,
  d.q13_prompt_types @> '"clarification"' AS q13_clarification,
  d.q13_prompt_types @> '"debug"' AS q13_debug,
  d.q13_prompt_types @> '"refinement"' AS q13_refinement,
  d.q13_prompt_types @> '"elaboration"' AS q13_elaboration,
  d.q13_prompt_types @> '"verification"' AS q13_verification,
  d.q13_prompt_types @> '"direct_answer"' AS q13_direct_answer,
  d.q13_prompt_types @> '"metacognitive"' AS q13_metacognitive,
  d.q13_prompt_types_other AS q13_other_text,

  -- Q14 Prompt Sources (JSONB → boolean columns)
  d.q14_prompt_sources @> '"self"' AS q14_self,
  d.q14_prompt_sources @> '"experienced_peer"' AS q14_experienced_peer,
  d.q14_prompt_sources @> '"novice_peer"' AS q14_novice_peer,
  d.q14_prompt_sources @> '"external"' AS q14_external,
  d.q14_prompt_sources_other AS q14_other_text,

  -- C-2: Q15 Purposes (JSONB → boolean columns)
  d.q15_purposes @> '"understanding"' AS q15_understanding,
  d.q15_purposes @> '"debugging"' AS q15_debugging,
  d.q15_purposes @> '"generating"' AS q15_generating,
  d.q15_purposes @> '"optimising"' AS q15_optimising,
  d.q15_purposes @> '"checking"' AS q15_checking,
  d.q15_purposes @> '"learning"' AS q15_learning,
  d.q15_purposes_other AS q15_other_text,

  -- C-3: Q16–Q17 Quality
  d.q16_accuracy,
  d.q16_clarity,
  d.q16_actionability,
  d.q16_trustworthiness,
  d.q16_relevance,
  d.q17_quality_open,

  -- C-4: Q18–Q19 Dependency
  d.q18a_heavy_reliance,
  d.q18b_self_first,
  d.q18c_critical_eval,
  d.q18d_cannot_without_ai,
  d.q18e_ai_starting_point,
  d.q19a_peer_reduces_ai,
  d.q19b_mutual_check,

  -- Section D: Q20–Q25 Emotions
  d.q20a_confidence,
  d.q20b_curiosity,
  d.q20c_enjoyment,
  d.q20d_pride,
  d.q21a_satisfaction,
  d.q21b_relief,
  d.q22a_frustration,
  d.q22b_anxiety,
  d.q22c_anger,
  d.q22d_shame,
  d.q23a_boredom,
  d.q23b_hopelessness,
  d.q24a_encouragement,
  d.q24b_inadequacy,
  d.q24c_belonging,
  d.q24d_observational_motivation,
  d.q24e_pace_pressure,
  d.q25_other_emotions,

  -- Section E: Q26–Q31 Reflection
  d.q26_memorable_interaction,
  d.q27_prompt_revision,
  d.q28_emotional_trajectory,
  d.q29_received_help,
  d.q30_gave_help,
  d.q31_composition_theorisation,

  -- Section F: Q32–Q33 Validity
  d.q32a_honesty,
  d.q32b_comprehension,
  d.q33_attention_check

FROM diary_entries d
LEFT JOIN students s ON d.student_id = s.student_id
ORDER BY d.student_id, d.week_number;
