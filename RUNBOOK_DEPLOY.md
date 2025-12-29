Runbook: Deploy STAGING (Supabase + Edge Functions + Migrations)

Prerequisites (you must provide these as GitHub repository secrets):
- SUPABASE_ACCESS_TOKEN — a CI token with permissions to deploy Edge Functions and run migrations (store in GitHub Secrets)
- SUPABASE_PROJECT_REF — your Supabase project ref string (found in project settings)
- SUPABASE_SERVICE_ROLE_KEY — service role key (server-only)
- NANOBANANA_API_KEY — Nano Banana API key for avatar generation
- CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET — for signed uploads
- LIVEPEER_API_KEY — if you want Livepeer streaming

Client-side envs (copy into your `.env.local` for local dev; do NOT commit keys):
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_CLOUDINARY_CLOUD_NAME (optional for client unsigned uploads)
- VITE_GEMINI_API_KEY (LLM features only; server-side Gemini recommended for image gen)

How to run the CI deploy (one-command)
1. Add the repository secrets above in GitHub: Settings → Secrets and variables → Actions → New repository secret.
2. Go to Actions tab → Supabase Deploy (STAGING) workflow → Run workflow (choose any branch and click Run workflow).

What the workflow does
- Runs SQL migrations in `migrations/` to create `challenge_proposals`, add `challenges` columns, and install triggers & example RLS policies.
- Deploys Edge Functions under `functions/*` (create_challenge, propose_logistics, confirm_challenge, generate_avatar_nanobanana).

Post-deploy verification
1. In Supabase SQL Editor, run: SELECT * FROM challenge_proposals LIMIT 1; — should not error (table exists).
2. Verify `challenges` has columns `current_status` and `metadata`:
   SELECT column_name FROM information_schema.columns WHERE table_name='challenges' AND column_name IN ('current_status','metadata');
3. Call the Edge Function test endpoint (replace PROJECT_REF and function name):
   curl -X POST https://<PROJECT_REF>.functions.supabase.co/create_challenge -H 'Content-Type: application/json' --data '{"challenger_id":"1","opponent_id":"2","discipline":"9-ball","race_to":7}'
4. Verify feed item created in `feed_items` for challenge (SELECT * FROM feed_items WHERE id LIKE 'chal_%' ORDER BY created_at DESC LIMIT 5;)

Rollback procedure
1. If the SQL migrations introduced unintended changes, restore DB from Supabase automatic backups (on the project settings → Database → Backups) or run the inverse SQL manually.
2. Edge Functions: you can rollback by redeploying previous versions of the functions or deleting the newly deployed functions via the supabase CLI.

Notes and next steps
- After running the workflow, you'll still need to wire the client to call the deployed Edge Functions and implement the client components (ChallengeModal, AvatarPicker, Feed). I will include these in the PR branch next.

