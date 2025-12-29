// @ts-ignore: Deno std/server is available at runtime on Netlify/Deno Edge
import { serve } from 'std/server';
// The Edge runtime provides global `fetch` and `Deno`; declare Deno to quiet TS in the editor
declare const Deno: any;

serve(async (req: Request) => {
  try {
    const body = await req.json();
    const { challenge_id, proposer_id, venue, scheduled_time, message } = body;
    if (!challenge_id || !proposer_id || !venue || !scheduled_time) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500 });
    }

    // Insert proposal
    const proposal = {
      challenge_id,
      proposer_id,
      venue,
      scheduled_time,
      message,
      created_at: new Date().toISOString()
    };

    const insert = await fetch(`${SUPABASE_URL}/rest/v1/challenge_proposals`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(proposal)
    });

    const insertResult = await insert.json();
    if (!insert.ok && insert.status >= 400) {
      return new Response(JSON.stringify({ error: insertResult }), { status: 500 });
    }

    // Update challenge metadata (store last proposal info)
    const metadata = {
      venue,
      scheduled_time,
      last_proposed_by: proposer_id
    };

    await fetch(`${SUPABASE_URL}/rest/v1/challenges?id=eq.${challenge_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ metadata, current_status: 'pending_confirmation', last_updated: new Date().toISOString() })
    });

    return new Response(JSON.stringify({ data: insertResult }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Server Error', details: String(err) }), { status: 500 });
  }
});

