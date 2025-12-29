// services/edgeFunctions.ts
// Lightweight wrappers to call the deployed Supabase Edge Functions from client code.

// services/edgeFunctions.ts
// Lightweight wrappers to call the deployed Edge Functions from client code.
// If you deploy functions under a different base URL, set VITE_SUPABASE_FUNCTIONS_URL.
const FUNCTIONS_BASE = ((import.meta as any).env?.VITE_SUPABASE_FUNCTIONS_URL) || '/.netlify/functions';

const postToFunction = async (path: string, payload: any) => {
  const url = `${FUNCTIONS_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
};

export const callCreateChallenge = (payload: any) => postToFunction('create_challenge', payload);
export const callProposeLogistics = (payload: any) => postToFunction('propose_logistics', payload);
export const callConfirmChallenge = (payload: any) => postToFunction('confirm_challenge', payload);
export const callGenerateAvatar = (payload: any) => postToFunction('generate_avatar_nanobanana', payload);

