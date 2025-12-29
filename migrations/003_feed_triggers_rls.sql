-- 003_feed_triggers_rls.sql
-- Create trigger functions to maintain feed_items and example RLS policies

-- 1) Trigger function to create a feed item when a challenge is created or updated to accepted
CREATE OR REPLACE FUNCTION public.fn_feed_from_challenge() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.feed_items(id, user_data, content, type, created_at)
    VALUES (
      concat('chal_', NEW.id),
      (SELECT row_to_json(p) FROM public.profiles p WHERE p.id = NEW.challenger_id),
      format('Has challenged %s to a race to %s in %s!', (SELECT display_name FROM public.profiles WHERE id = NEW.opponent_id), NEW.race_to, NEW.discipline),
      'challenge_update',
      now()
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND NEW.current_status = 'accepted' AND (OLD.current_status IS DISTINCT FROM NEW.current_status) THEN
    INSERT INTO public.feed_items(id, user_data, content, type, created_at)
    VALUES (
      concat('match_', NEW.id),
      json_build_object('id','sys','display_name','League Bot','rank',0,'fargo_rate',0,'is_claimed',false)::jsonb,
      format('MATCH SET: %s vs %s @ %s on %s.', (SELECT display_name FROM public.profiles WHERE id = NEW.challenger_id), (SELECT display_name FROM public.profiles WHERE id = NEW.opponent_id), COALESCE(NEW.metadata->>'venue','TBD'), COALESCE(NEW.metadata->>'scheduled_time','TBD')),
      'system',
      now()
    );
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger to challenges table
DROP TRIGGER IF EXISTS trg_feed_from_challenge ON public.challenges;
CREATE TRIGGER trg_feed_from_challenge
AFTER INSERT OR UPDATE ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION public.fn_feed_from_challenge();

-- 2) RLS policies (examples)
-- Enable RLS on challenges and challenge_proposals and feed_items
ALTER TABLE IF EXISTS public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.challenge_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feed_items ENABLE ROW LEVEL SECURITY;

-- Allow selects for everyone on feed_items (public read-only)
CREATE POLICY IF NOT EXISTS "feed_public_select" ON public.feed_items
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert feed items
CREATE POLICY IF NOT EXISTS "feed_insert_auth" ON public.feed_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Challenges: only authenticated users can create
CREATE POLICY IF NOT EXISTS "challenges_insert_auth" ON public.challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Challenge proposals: only participants can insert for a specific challenge (use function)
-- We'll create a helper function for the policy
CREATE OR REPLACE FUNCTION public.fn_is_participant(challenge_id text, user_id text) RETURNS boolean LANGUAGE sql AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.challenges c WHERE c.id = challenge_id AND (c.challenger_id = user_id OR c.opponent_id = user_id)
  );
$$;

CREATE POLICY IF NOT EXISTS "proposal_insert_participant" ON public.challenge_proposals
  FOR INSERT
  TO authenticated
  WITH CHECK (public.fn_is_participant(NEW.challenge_id, auth.uid()));

-- Allow participants to select their challenges
CREATE POLICY IF NOT EXISTS "challenges_select_participant" ON public.challenges
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow participants to update their challenge only for status transitions via RPC (restrict updates)
CREATE POLICY IF NOT EXISTS "challenges_update_participant" ON public.challenges
  FOR UPDATE
  TO authenticated
  USING ( (auth.uid() = challenger_id) OR (auth.uid() = opponent_id) )
  WITH CHECK (true);

