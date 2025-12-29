#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/create_pr_and_push.sh "YourRemote"
# Requires: git, gh (GitHub CLI) installed and authenticated.

BRANCH=feat/supabase-challenges-ci
BASE_BRANCH=main
COMMIT_MSG="feat(ci): add supabase migrations, edge functions, avatar flow and client UI for challenge flow"

echo "Creating branch: $BRANCH"
git checkout -b $BRANCH

echo "Staging files..."
git add migrations functions .github RUNBOOK_DEPLOY.md services components screens

echo "Committing..."
git commit -m "$COMMIT_MSG"

echo "Pushing to origin/$BRANCH"
git push -u origin $BRANCH

echo "Opening PR via gh cli..."
gh pr create --base $BASE_BRANCH --head $BRANCH --title "feat: Supabase challenge flow + CI deploy (STAGING)" --body "This PR adds Supabase DB migrations, Edge Functions for challenge workflow, Nano Banana avatar generator Edge Function, client-side wrappers and initial UI components (ChallengeModal, AvatarPicker, Feed).\n\nRunbook: RUNBOOK_DEPLOY.md\n\nChecklist:\n- [ ] Add GitHub Secrets as described in RUNBOOK_DEPLOY.md\n- [ ] Run Actions workflow 'Supabase Deploy (STAGING)'\n- [ ] Verify migrations and functions in Supabase\n\nNotes: Edge Functions are Deno-based and expect server env vars (SUPABASE_SERVICE_ROLE_KEY, NANOBANANA_API_KEY, etc.)."

echo "PR created (or opened). Please add the required GitHub secrets and run the CI workflow as documented in RUNBOOK_DEPLOY.md."

