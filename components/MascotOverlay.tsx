
import React, { useState, useEffect, useRef } from 'react';
import { generateMascotCharacter } from '../services/geminiService';
import { X } from 'lucide-react';

export const MascotOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [speechBubble, setSpeechBubble] = useState<string>('');
  const hideTimeoutRef = useRef<number | null>(null);

  const sharkQuotes = [
    "I smell blood in the water... or is that just chalk?",
    "Need a spot? I only charge 50%.",
    "You call that a break?",
    "Hustle or be hustled, friend."
  ];

  const leopardQuotes = [
    "Fast game, fast money.",
    "I never change my spots, but I change the score.",
    "Care for a friendly wager?",
    "You're shooting like a gazelle... shaky."
  ];

  useEffect(() => {
    const triggerMascot = async () => {
      // 10% chance to appear every interval if not already visible
      if (!isVisible && Math.random() > 0.9) { 
        const type = Math.random() > 0.5 ? 'shark' : 'leopard';
        
        try {
          // We no longer store mascot images in LocalStorage to avoid QuotaExceededError.
          // These are transient assets that can be regenerated or fetched once per session.
          const img = await generateMascotCharacter(type);
          
          if (img) {
            setImageUrl(img);
            setSpeechBubble(type === 'shark' 
              ? sharkQuotes[Math.floor(Math.random() * sharkQuotes.length)] 
              : leopardQuotes[Math.floor(Math.random() * leopardQuotes.length)]
            );
            setIsVisible(true);
            
            if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = window.setTimeout(() => {
              setIsVisible(false);
            }, 8000);
          }
        } catch (err) {
          console.warn("Mascot failed to appear due to network or quota issues:", err);
        }
      }
    };

    const interval = setInterval(triggerMascot, 20000);

    return () => {
      clearInterval(interval);
      if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);
    };
  }, [isVisible]);

  if (!isVisible || !imageUrl) return null;

  return (
    <div className={`fixed bottom-0 right-0 z-[60] transition-transform duration-1000 ease-in-out pointer-events-none ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="relative w-48 h-48 sm:w-64 sm:h-64 pointer-events-auto">
        {/* Speech Bubble */}
        <div className="absolute -top-12 -left-12 bg-white text-black p-3 rounded-2xl rounded-br-none shadow-xl text-[10px] font-bold font-display w-36 animate-bounce border-2 border-slate-900">
          {speechBubble}
        </div>

        {/* Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 bg-black/70 text-white rounded-full p-1 hover:bg-black z-20"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Image */}
        <img 
          src={imageUrl} 
          alt="League Mascot" 
          className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(0,0,0,1)]" 
          style={{ maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}
        />
      </div>
    </div>
  );
};
