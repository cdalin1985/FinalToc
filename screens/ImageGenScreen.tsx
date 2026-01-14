import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Download, AlertCircle, ImageIcon, UserCircle2, Zap, Info } from 'lucide-react';
import { Button } from '../components/Button';
import { generateProImage } from '../services/geminiService';
import { updateUser, getCurrentUser, getPrestigeTokens, recordPrestigeGeneration, recordGeneration, canPlayerGenerate } from '../services/persistenceService';
import { uploadBase64ToCloudinary } from '../services/cloudinaryService';

const PRESETS = [
  { name: 'None', prompt: '' },
  { name: 'Cyberpunk', prompt: 'cyberpunk style, neon lights, futuristic, high detail, 8k' },
  { name: 'Studio', prompt: 'professional studio lighting, neutral background, bokeh' },
  { name: 'Retro', prompt: 'VHS tracking grain, 1980s analog film, warm colors' },
  { name: 'Sketch', prompt: 'hand-drawn charcoal sketch, artistic lines, parchment' }
];

export const ImageGenScreen: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [preset, setPreset] = useState(PRESETS[0]);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prestigeCount, setPrestigeCount] = useState(0);

  const user = getCurrentUser();

  useEffect(() => {
    if (user) setPrestigeCount(getPrestigeTokens(user.id));
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return;
    
    if (!canPlayerGenerate(user.id)) {
        setError("Monthly generation limit reached.");
        return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const isPrestige = prestigeCount > 0;
      const fullPrompt = `${preset.prompt} ${prompt}`.trim();
      const { url } = await generateProImage(fullPrompt, aspectRatio, isPrestige);
      
      if (url) {
        setResultImage(url);
        recordGeneration(user.id);
        if (isPrestige) {
            recordPrestigeGeneration(user.id);
            setPrestigeCount(prev => prev - 1);
        }
      } else {
        setError("The Whisper could not synthesize an image. Adjust your description.");
      }
    } catch (e: any) {
      setError("Unable to connect to The Whisper creative relay.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetAsAvatar = async () => {
    if (!resultImage || !user) return;
    setIsUpdatingAvatar(true);
    try {
      const cloudUrl = await uploadBase64ToCloudinary(resultImage);
      if (cloudUrl) {
        await updateUser({ ...user, avatar_url: cloudUrl });
        alert("Identity updated across league ranks.");
      }
    } catch (e) {
      setError("Failed to link image to profile.");
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-white text-outline drop-shadow-lg italic uppercase tracking-tighter">
          CREATIVE STUDIO
        </h2>
        <div className="flex items-center justify-center gap-2 mt-2">
            <div className={`flex items-center gap-1 bg-black/40 px-3 py-1 rounded-full border ${prestigeCount > 0 ? 'border-billiard-yellow/30' : 'border-slate-800'}`}>
                <Zap className={`w-3 h-3 ${prestigeCount > 0 ? 'text-billiard-yellow' : 'text-slate-600'}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest italic ${prestigeCount > 0 ? 'text-white' : 'text-slate-600'}`}>
                    Prestige Tokens: {prestigeCount} / 2
                </span>
            </div>
        </div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border-2 border-slate-700 shadow-2xl space-y-6 relative overflow-hidden">
        {prestigeCount === 0 && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3 text-[10px] text-blue-300 font-bold uppercase tracking-widest italic">
                <Info className="w-4 h-4 flex-shrink-0" />
                Operating in standard efficiency mode. Tokens exhausted.
            </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Style Matrix</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => setPreset(p)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                  preset.name === p.name 
                    ? 'bg-billiard-yellow border-white text-black shadow-lg shadow-billiard-yellow/20' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Visual Synthesis Intent</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A master of the cue in a smoke-filled room..."
            className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:border-billiard-yellow outline-none transition-all h-24 resize-none text-sm font-medium"
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          isLoading={isLoading} 
          disabled={!prompt.trim()} 
          className="w-full py-4 shadow-[0_0_20px_rgba(255,179,0,0.1)]"
        >
          {prestigeCount > 0 ? <Zap className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          {prestigeCount > 0 ? 'SYNTHESIZE PRESTIGE' : 'SYNTHESIZE STANDARD'}
        </Button>
      </div>

      {resultImage && (
        <div className="space-y-4 animate-slide-up">
          <div className="bg-slate-900 rounded-3xl border-2 border-billiard-yellow/30 overflow-hidden shadow-2xl">
            <img src={resultImage} alt="Generated" className="w-full h-auto" />
            <div className="p-4 flex gap-3 border-t border-slate-800 bg-slate-900/50">
              <Button onClick={handleSetAsAvatar} isLoading={isUpdatingAvatar} className="flex-1 py-3 text-xs bg-slate-800 border-slate-600 shadow-none hover:bg-slate-700">
                <UserCircle2 className="w-4 h-4" /> APPLY TO PROFILE
              </Button>
              <button onClick={() => { const l = document.createElement('a'); l.href = resultImage; l.download = 'whisper-synthesis.png'; l.click(); }} className="p-3 bg-billiard-yellow text-black rounded-xl hover:scale-105 active:scale-95 transition-transform">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500/40 p-3 rounded-xl flex items-center gap-3 text-xs text-red-200 font-bold uppercase tracking-tight">
          <AlertCircle className="w-5 h-5 text-red-500" /> {error}
        </div>
      )}

      <div className="mt-12 pt-6 border-t border-white/5 text-center px-4">
         <p className="text-[7px] text-slate-600 font-bold uppercase tracking-[0.2em] leading-relaxed">
            Visual synthesis courtesy of 'The Whisper' // Licensed via Chase Dalin AI Protocol
            <br/>
            Proprietary render technology for Top of the Capital league members only.
         </p>
      </div>
    </div>
  );
};