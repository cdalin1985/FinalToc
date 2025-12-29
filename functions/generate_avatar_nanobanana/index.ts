// @ts-ignore: Deno std/server is available at runtime on Netlify/Deno Edge
import { serve } from 'std/server';
// Declare Deno so the editor/tsserver doesn't show errors in the local project
declare const Deno: any;

// Edge function that will (1) optionally ask Gemini to craft a short
// image-generation prompt and then (2) call Nano Banana to generate
// avatar image variants. This keeps API keys server-side.

serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Allow': 'POST', 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const { prompt: clientPrompt, user_id, player_name } = body || {};

    if (!user_id) return new Response(JSON.stringify({ error: 'Missing user_id' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const NANOBANANA_API_KEY = Deno.env.get('NANOBANANA_API_KEY') || '';
    if (!NANOBANANA_API_KEY) return new Response(JSON.stringify({ error: 'Nano Banana key not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

    let prompt = clientPrompt;

    // If the client didn't supply a prompt, use Gemini server-side to create one.
    if (!prompt) {
      const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
      if (!GEMINI_API_KEY) return new Response(JSON.stringify({ error: 'No prompt provided and GEMINI_API_KEY not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

      const model = 'gemini-1.5-flash';
      const geminiPromptText = `Create a single, concise, vivid visual description (6-10 words) suitable for an image-generation avatar prompt. Player name: ${player_name || 'player'}. Return only the description, no extra commentary.`;

      const geminiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
        body: JSON.stringify({ prompt: { text: geminiPromptText }, maxOutputTokens: 60, temperature: 0.8 })
      });

      if (!geminiResp.ok) {
        console.error('Gemini API error', await geminiResp.text());
        return new Response(JSON.stringify({ error: 'Gemini API error' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }

      const geminiData = await geminiResp.json();

      // Attempt to robustly extract the generated text from a few possible shapes
      let generated: string | null = null;
      if (Array.isArray(geminiData.candidates) && geminiData.candidates.length) {
        const c: any = geminiData.candidates[0];
        generated = c.content ?? c.output ?? c.text ?? (Array.isArray(c.content) ? c.content.map((p: any) => p.text || '').join(' ') : undefined);
      }
      generated = generated || geminiData.output?.text || geminiData.text || geminiData.reply?.text || null;
      if (!generated) generated = String(geminiData).slice(0, 300);

      prompt = String(generated).replace(/\n/g, ' ').trim().replace(/^"|"$/g, '');
    }

    // Call Nano Banana with the (client-supplied or Gemini-generated) prompt
    const nbResp = await fetch('https://api.nanobanana.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NANOBANANA_API_KEY}`
      },
      body: JSON.stringify({ prompt, variants: 4, user_id })
    });

    if (!nbResp.ok) {
      const txt = await nbResp.text();
      console.error('NanoBanana error', txt);
      return new Response(JSON.stringify({ error: 'NanoBanana API error', details: txt }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }

    const nbData = await nbResp.json();
    return new Response(JSON.stringify({ prompt_used: prompt, data: nbData }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Server error', details: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});

