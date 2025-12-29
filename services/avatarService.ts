// services/avatarService.ts
// Client wrapper to request Nano Banana avatar generation via Edge Function

// services/avatarService.ts
// Client wrapper to request Nano Banana avatar generation via Edge Function
// Keeps caller simple: supply optional `prompt` and required `userId`.

export const generateAvatarVariants = async (prompt: string | null, userId: string) => {
  const payload: any = { user_id: userId };
  if (prompt) payload.prompt = prompt;

  const res = await fetch(`/.netlify/functions/generate_avatar_nanobanana`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Avatar generation failed: ${res.status} ${txt}`);
  }

  return res.json();
};

