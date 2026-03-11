-- ============================================
-- Learning Diary v3.0 — Schema Update v2
-- Adds "Other" free-text fields for checkbox questions
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS genai_tools_other TEXT;
ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS q13_prompt_types_other TEXT;
ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS q14_prompt_sources_other TEXT;
ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS q15_purposes_other TEXT;
