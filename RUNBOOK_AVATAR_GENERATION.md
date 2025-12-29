Avatar generation edge function & environment variables
===============================================

Overview
--------
This project includes an Edge Function at [`functions/generate_avatar_nanobanana/index.ts`](functions/generate_avatar_nanobanana/index.ts:1) that will:

- Accept a POST request with body: { user_id, prompt?, player_name? }
- If `prompt` is not supplied, call the Gemini API server-side (requires `GEMINI_API_KEY`) to generate a short image prompt
- Call Nano Banana (requires `NANOBANANA_API_KEY`) to create 4 avatar variants and return the result

Environment variables
---------------------
- `NANOBANANA_API_KEY` — set to your Nano Banana API key (server-side only)
- `GEMINI_API_KEY` — set to your Google Gemini API key (server-side only, optional if you always send prompts)
- `VITE_SUPABASE_FUNCTIONS_URL` — optional client-side base URL for deployed functions (defaults to `/.netlify/functions`)

Deployment / Netlify notes
-------------------------
1. Add `NANOBANANA_API_KEY` and `GEMINI_API_KEY` to your Netlify site environment variables (Settings → Build & deploy → Environment).
2. Deploy the `functions/` directory as Netlify Functions (or Supabase Edge Functions). The code expects the function path:
   - Netlify: `/.netlify/functions/generate_avatar_nanobanana`
   - Supabase functions: adjust `services/edgeFunctions.ts` `VITE_SUPABASE_FUNCTIONS_URL` accordingly.

Testing locally (curl)
----------------------
Example with client-supplied prompt:

curl -X POST 'http://localhost:8888/.netlify/functions/generate_avatar_nanobanana' \
  -H 'Content-Type: application/json' \
  -d '{"user_id":"user_123","prompt":"A robotic shark wearing a leather jacket holding a cue"}'

Example without prompt (server will call Gemini):

curl -X POST 'http://localhost:8888/.netlify/functions/generate_avatar_nanobanana' \
  -H 'Content-Type: application/json' \
  -d '{"user_id":"user_123","player_name":"Roo"}'

Response
--------
The function returns JSON: { prompt_used: string, data: <NanoBanana response> }

Client usage
------------
The client wrapper is at [`services/avatarService.ts`](services/avatarService.ts:1). Use:

const res = await generateAvatarVariants(promptOrNull, userId);

Notes about TypeScript diagnostics
---------------------------------
The Edge function files run on a Deno-based platform, which exposes globals like `Deno` and modules like `std/server` that are not present in the browser/Node type system. To avoid noisy TypeScript diagnostics in the editor, the repository has added lightweight annotations in the functions (see `functions/*/index.ts`). These are safe because the files are only executed in the Edge runtime.

