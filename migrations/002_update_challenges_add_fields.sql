-- 002_update_challenges_add_fields.sql
-- Add fields to challenges for status tracking and metadata

ALTER TABLE IF EXISTS public.challenges
  ADD COLUMN IF NOT EXISTS current_status text DEFAULT 'pending_logistics',
  ADD COLUMN IF NOT EXISTS last_updated timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS metadata jsonb;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(current_status);
CREATE INDEX IF NOT EXISTS idx_challenges_last_updated ON public.challenges(last_updated);

