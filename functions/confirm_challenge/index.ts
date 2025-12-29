// @ts-ignore: Deno std/server is available at runtime on Netlify/Deno Edge
import { serve } from 'std/server';
// The Edge runtime provides global `fetch` and `Deno`; declare Deno to quiet TS in the editor
declare const Deno: any;

serve(async (req: Request) => {
  try {
    const body = await req.json();
    const { challenge_id, confirmer_id, proposal_id } = body;
    if (!challenge_id || !confirmer_id || !proposal_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500 });
    }

    // 1) Verify proposal belongs to challenge
    const propRes = await fetch(`${SUPABASE_URL}/rest/v1/challenge_proposals?id=eq.${proposal_id}`, {
      headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
    });
    const prop = await propRes.json();
    if (!prop || prop.length === 0) return new Response(JSON.stringify({ error: 'Proposal not found' }), { status: 404 });
    if (prop[0].challenge_id !== challenge_id) return new Response(JSON.stringify({ error: 'Proposal mismatch' }), { status: 400 });

    // 2) Fetch challenge to discover participants
    const chalRes = await fetch(`${SUPABASE_URL}/rest/v1/challenges?id=eq.${challenge_id}`, {
      headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
    });
    const chal = await chalRes.json();
    if (!chal || chal.length === 0) return new Response(JSON.stringify({ error: 'Challenge not found' }), { status: 404 });

    const challenger_id = chal[0].challenger_id;
    const opponent_id = chal[0].opponent_id;

    // 3) Update challenge to accepted and attach accepted_proposal_id in metadata
    const patchBody: any = {
      current_status: 'accepted',
      last_updated: new Date().toISOString(),
      metadata: {
        accepted_proposal_id: proposal_id,
        venue: prop[0].venue,
        scheduled_time: prop[0].scheduled_time
      }
    };

    await fetch(`${SUPABASE_URL}/rest/v1/challenges?id=eq.${challenge_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(patchBody)
    });

    // 4) Create a match record
    const match = {
      id: `m_${Date.now()}`,
      challenge_id,
      player1_id: challenger_id,
      player2_id: opponent_id,
      venue: prop[0].venue,
      scheduled_time: prop[0].scheduled_time,
      score1: 0,
      score2: 0,
      is_live: false,
      viewers: 0,
      created_at: new Date().toISOString()
    };

    const insert = await fetch(`${SUPABASE_URL}/rest/v1/matches`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(match)
    });

    const inserted = await insert.json();

    return new Response(JSON.stringify({ data: inserted }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Server Error', details: String(err) }), { status: 500 });
  }
});

