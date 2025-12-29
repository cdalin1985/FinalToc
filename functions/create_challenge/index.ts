// @ts-ignore: Deno std/server is available at runtime on Netlify/Deno Edge
import { serve } from 'std/server';
// The Edge runtime provides global `fetch` and `Deno`; declare Deno to quiet TS in the editor
declare const Deno: any;

// Edge Function: create_challenge
// Expects JSON body: { challenger_id, opponent_id, discipline, race_to }
// Uses SUPABASE_SERVICE_ROLE_KEY from env to validate ranks and insert canonical challenge row.

serve(async (req: Request) => {
  try {
    const body = await req.json();
    const { challenger_id, opponent_id, discipline, race_to } = body;
    if (!challenger_id || !opponent_id || !discipline || !race_to) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Basic validation
    const allowed = ['8-ball','9-ball','10-ball'];
    if (!allowed.includes(discipline)) return new Response(JSON.stringify({ error: 'Invalid discipline' }), { status: 400 });
    if (race_to < 5) return new Response(JSON.stringify({ error: 'race_to must be >= 5' }), { status: 400 });

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''; // set in deployment
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500 });
    }

    // 1) Fetch ranks for both players
    const fetchProfiles = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${challenger_id}&select=rank`, {
      headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
    });
    const challenger = await fetchProfiles.json();

    const fetchProfiles2 = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${opponent_id}&select=rank`, {
      headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
    });
    const opponent = await fetchProfiles2.json();

    if (!challenger || !opponent) return new Response(JSON.stringify({ error: 'Could not find players' }), { status: 404 });

    const rankA = challenger[0]?.rank;
    const rankB = opponent[0]?.rank;
    if (rankA === undefined || rankB === undefined) return new Response(JSON.stringify({ error: 'Rank missing' }), { status: 400 });

    if (Math.abs(rankA - rankB) > 5) {
      return new Response(JSON.stringify({ error: 'Rank difference > 5 not allowed' }), { status: 403 });
    }

    // 2) Insert challenge via supabase REST (upsert)
    const newChallenge = {
      id: `c_${Date.now()}`,
      challenger_id,
      opponent_id,
      discipline,
      race_to,
      current_status: 'pending_logistics',
      created_at: new Date().toISOString()
    };

    const insert = await fetch(`${SUPABASE_URL}/rest/v1/challenges`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(newChallenge)
    });

    const insertResult = await insert.json();
    if (!insert.ok && insert.status >= 400) {
      return new Response(JSON.stringify({ error: insertResult }), { status: 500 });
    }

    return new Response(JSON.stringify({ data: insertResult }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Server Error', details: String(err) }), { status: 500 });
  }
});

