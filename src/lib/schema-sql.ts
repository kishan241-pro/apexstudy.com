export const SUPABASE_SQL_SCHEMA = `-- ApexStudy B2C SaaS Platform - Supabase PostgreSQL Schema with Row-Level Security (RLS)
-- Run this in your Supabase SQL Editor to provision all tables and security policies.

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    grade TEXT NOT NULL DEFAULT 'Class 10',
    stream TEXT DEFAULT NULL,
    target_percentage INTEGER NOT NULL DEFAULT 95,
    current_xp INTEGER NOT NULL DEFAULT 0,
    streak_days INTEGER NOT NULL DEFAULT 0,
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    last_active_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 3. Create TODO_TASKS Table (5 Daily AI Tasks)
CREATE TABLE IF NOT EXISTS public.todo_tasks (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    subject TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    xp_reward INTEGER NOT NULL DEFAULT 50,
    day_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for todo_tasks
ALTER TABLE public.todo_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
    ON public.todo_tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
    ON public.todo_tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
    ON public.todo_tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
    ON public.todo_tasks FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_user_day ON public.todo_tasks(user_id, day_date);

-- 4. Create CHAPTER_REVISIONS Table (NCERT Chapter Checklists for Classes 9-12)
CREATE TABLE IF NOT EXISTS public.chapter_revisions (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    chapter_id TEXT NOT NULL,
    revised BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, chapter_id)
);

ALTER TABLE public.chapter_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chapter revisions"
    ON public.chapter_revisions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own chapter revisions"
    ON public.chapter_revisions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chapter revisions"
    ON public.chapter_revisions FOR UPDATE
    USING (auth.uid() = user_id);

-- 5. Create STUDY_MATERIALS Table
CREATE TABLE IF NOT EXISTS public.study_materials (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    raw_content TEXT NOT NULL,
    summary JSONB NOT NULL DEFAULT '[]'::jsonb,
    flashcards JSONB NOT NULL DEFAULT '[]'::jsonb,
    quiz JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for study_materials
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own study materials"
    ON public.study_materials FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study materials"
    ON public.study_materials FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study materials"
    ON public.study_materials FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_materials_user ON public.study_materials(user_id, created_at DESC);

-- 6. Create DAILY_TASK_LOGS Table (Monthly Progress & Pomodoro Analytics)
CREATE TABLE IF NOT EXISTS public.daily_task_logs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_date DATE NOT NULL,
    completed_count INTEGER NOT NULL DEFAULT 0,
    total_count INTEGER NOT NULL DEFAULT 5,
    percentage INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, day_date)
);

ALTER TABLE public.daily_task_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily task logs"
    ON public.daily_task_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own daily task logs"
    ON public.daily_task_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily task logs"
    ON public.daily_task_logs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_logs_user_date ON public.daily_task_logs(user_id, day_date);
`;
