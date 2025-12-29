-- 001_create_challenge_proposals.sql
-- Creates a normalized table to store immutable logistics proposals for challenges
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.challenge_proposals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id text NOT NULL,
  proposer_id text NOT NULL,
  venue text,
  scheduled_time timestamptz,
  message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_challenge_proposals_challenge_id ON public.challenge_proposals(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_proposals_proposer_id ON public.challenge_proposals(proposer_id);

