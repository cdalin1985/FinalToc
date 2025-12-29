import React, { useState } from 'react';
import { generateAvatarVariants } from '../services/avatarService';
import { updateUser } from '../services/persistenceService';
import { Button } from './Button';
import { User } from '../types';

interface Props {
  currentUser: User;
  onUpdated?: (user: User) => void;
}

export const AvatarPicker: React.FC<Props> = ({ currentUser, onUpdated }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [variants, setVariants] = useState<string[] | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const res = await generateAvatarVariants(prompt, currentUser.id);
      // Expect res.data.images or res.data
      const imgs = res?.data?.images || res?.data?.images || res?.data || [];
      // Normalize to array of URLs
      const urls = Array.isArray(imgs) ? imgs : (imgs.urls || []);
      setVariants(urls.slice(0,4));
    } catch (err) {
      console.error('Avatar generation error', err);
      alert('Avatar generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const pickVariant = async (url: string) => {
    // Persist to user via updateUser
    const updated: User = { ...currentUser, avatar_url: url };
    await updateUser(updated);
    if (onUpdated) onUpdated(updated);
    alert('Avatar saved');
  };

  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
      <h4 className="font-display text-sm text-white mb-3">Generate Avatar</h4>
      <div className="flex gap-2 mb-3">
        <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g. Robotic shark with a cue" className="flex-1 bg-slate-800 p-3 rounded" />
        <Button size="sm" onClick={handleGenerate} isLoading={isLoading}>Generate</Button>
      </div>

      {variants ? (
        <div className="grid grid-cols-2 gap-2">
          {variants.map((v, i) => (
            <button key={i} onClick={() => pickVariant(v)} className="p-0 bg-transparent border rounded overflow-hidden">
              <img src={v} alt={`avatar-${i}`} className="w-full h-32 object-cover" />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-sm">No variants yet. Enter a prompt and generate.</p>
      )}
    </div>
  );
};

