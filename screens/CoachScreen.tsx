import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { Lightbulb, Send, BookOpen, Trash2, Info } from 'lucide-react';
import { getCoachingAdvice, getHistoryNugget } from '../services/geminiService';

interface CoachScreenProps {
  currentUser: User;
}

interface Ball {
  id: string;
  x: number;
  y: number;
}

export const CoachScreen: React.FC<CoachScreenProps> = ({ currentUser }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [nugget, setNugget] = useState<string | null>(null);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [selectedBallId, setSelectedBallId] = useState<string | null>(null);
  
  const tableRef = useRef<HTMLDivElement>(null);
  const draggingBallRef = useRef<string | null>(null);

  useEffect(() => {
    fetchNugget();

    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingBallRef.current || !tableRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      
      const rect = tableRef.current.getBoundingClientRect();
      let x = ((clientX - rect.left) / rect.width) * 100;
      let y = ((clientY - rect.top) / rect.height) * 100;

      // Ball physics clamping
      const radiusX = 2; 
      const radiusY = 4;
      x = Math.max(radiusX, Math.min(100 - radiusX, x));
      y = Math.max(radiusY, Math.min(100 - radiusY, y));

      setBalls(prev => prev.map(b => b.id === draggingBallRef.current ? { ...b, x, y } : b));
    };

    const handleGlobalUp = () => {
      draggingBallRef.current = null;
    };

    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('touchmove', handleGlobalMove, { passive: false });
    window.addEventListener('touchend', handleGlobalUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, []);

  const fetchNugget = async () => {
    const fact = await getHistoryNugget();
    setNugget(fact);
  };

  const handleAskCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && balls.length === 0) return;

    setLoading(true);
    setResponse(null);
    
    let context = balls.length > 0 
      ? `Table Layout: ${balls.map(b => `${b.id} at (${Math.round(b.x)},${Math.round(b.y)})`).join(', ')}.\n` 
      : "";
    
    context += query.trim() ? `Question: ${query}` : "Suggest the best tactical play.";
    
    const advice = await getCoachingAdvice(currentUser.fargo_rate, context);
    setResponse(advice);
    setLoading(false);
  };

  const addBall = (id: string) => {
    if (balls.find(b => b.id === id)) return;
    setBalls([...balls, { id, x: 50, y: 50 }]);
    setSelectedBallId(id);
  };

  const removeBall = (id: string) => {
    setBalls(balls.filter(b => b.id !== id));
    if (selectedBallId === id) setSelectedBallId(null);
  };

  const setScenario = (scenario: 'break' | 'safety' | 'kick') => {
      let newBalls: Ball[] = [];
      if (scenario === 'break') {
          newBalls = [
              { id: 'cue', x: 25, y: 50 },
              { id: '1', x: 70, y: 50 },
              { id: '9', x: 74, y: 50 },
              { id: '2', x: 72, y: 48 },
              { id: '3', x: 72, y: 52 },
          ];
      } else if (scenario === 'safety') {
          newBalls = [
             { id: 'cue', x: 10, y: 50 },
             { id: '1', x: 80, y: 50 },
             { id: '2', x: 90, y: 50 }, // Blocking ball
          ];
      } else if (scenario === 'kick') {
          newBalls = [
              { id: 'cue', x: 50, y: 80 },
              { id: '1', x: 50, y: 20 },
              { id: '8', x: 50, y: 50 }, // Obstacle
          ];
      }
      setBalls(newBalls);
      setResponse(null);
  };

  const getBallStyle = (id: string) => {
    const colors: Record<string, string> = {
      'cue': '#ffffff', '1': '#EAB308', '9': '#EAB308', '2': '#2563EB', '10': '#2563EB',
      '3': '#DC2626', '11': '#DC2626', '4': '#9333EA', '12': '#9333EA', '5': '#EA580C',
      '13': '#EA580C', '6': '#16A34A', '14': '#16A34A', '7': '#881337', '15': '#881337', '8': '#000000',
    };
    const color = colors[id] || '#ffffff';
    const num = parseInt(id);
    const isStripe = !isNaN(num) && num > 8;

    if (id === 'cue') return { backgroundColor: '#fff', border: '1px solid #cbd5e1' };
    if (isStripe) return {
      background: `linear-gradient(to bottom, white 20%, ${color} 20%, ${color} 80%, white 80%)`,
      color: id === '9' ? 'black' : 'white',
      border: '1px solid rgba(0,0,0,0.2)'
    };
    return { backgroundColor: color, color: id === '1' ? 'black' : 'white' };
  };

  return (
    <div className="h-full flex flex-col font-sans animate-fade-in pb-24 select-none">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-billiard-yellow" />
            PRO CADDIE
        </h2>
        <div className="flex gap-2">
            <button onClick={() => setScenario('break')} className="text-[10px] bg-slate-800 px-2 py-1 rounded border border-slate-600 hover:bg-slate-700">BREAK</button>
            <button onClick={() => setScenario('safety')} className="text-[10px] bg-slate-800 px-2 py-1 rounded border border-slate-600 hover:bg-slate-700">SAFE</button>
            <button onClick={() => setScenario('kick')} className="text-[10px] bg-slate-800 px-2 py-1 rounded border border-slate-600 hover:bg-slate-700">KICK</button>
        </div>
      </div>

      {nugget && (
          <div className="mb-4 bg-slate-800/80 border-l-4 border-chalk p-3 rounded-r-lg text-xs italic text-slate-300 relative">
              <span className="font-bold text-chalk block mb-1 uppercase">League History Tip</span>
              {nugget}
              <button onClick={() => setNugget(null)} className="absolute top-1 right-2 text-slate-500 hover:text-white">x</button>
          </div>
      )}

      <div className="flex gap-2 mb-4 items-start touch-none">
          <div className="w-10 flex flex-col gap-2 max-h-[220px] overflow-y-auto scrollbar-none py-1 custom-scrollbar">
             <button onClick={() => addBall('cue')} className="w-8 h-8 rounded-full border-2 border-slate-300 shadow-lg bg-white flex-shrink-0" />
             {Array.from({ length: 15 }, (_, i) => (i + 1).toString()).map(num => (
                 <button 
                    key={num} 
                    onClick={() => addBall(num)}
                    style={getBallStyle(num)}
                    className={`w-8 h-8 rounded-full shadow-lg text-[10px] font-bold flex items-center justify-center flex-shrink-0 border border-black/20 ${selectedBallId === num ? 'ring-2 ring-white' : ''}`}
                 >
                    {num}
                 </button>
             ))}
          </div>

          <div className="flex-1 bg-wood p-3 rounded-xl shadow-2xl relative z-0 border-2 border-black">
            <div 
                ref={tableRef}
                className="aspect-[2/1] bg-felt relative rounded-lg border-[16px] border-slate-800 overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] cursor-crosshair touch-none"
            >
                {/* Pockets */}
                <div className="absolute top-[-8px] left-[-8px] w-8 h-8 bg-black rounded-br-2xl z-0" />
                <div className="absolute top-[-8px] right-[-8px] w-8 h-8 bg-black rounded-bl-2xl z-0" />
                <div className="absolute bottom-[-8px] left-[-8px] w-8 h-8 bg-black rounded-tr-2xl z-0" />
                <div className="absolute bottom-[-8px] right-[-8px] w-8 h-8 bg-black rounded-tl-2xl z-0" />
                <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-8 h-8 bg-black rounded-b-2xl z-0" />
                <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-8 h-8 bg-black rounded-t-2xl z-0" />
                
                {balls.map((ball) => (
                    <div
                        key={ball.id}
                        onMouseDown={(e) => { e.stopPropagation(); draggingBallRef.current = ball.id; setSelectedBallId(ball.id); }}
                        onTouchStart={(e) => { e.stopPropagation(); draggingBallRef.current = ball.id; setSelectedBallId(ball.id); }}
                        style={{ 
                            left: `${ball.x}%`, 
                            top: `${ball.y}%`,
                            ...getBallStyle(ball.id)
                        }}
                        className={`absolute w-4 h-4 -ml-2 -mt-2 rounded-full shadow-lg flex items-center justify-center text-[6px] font-bold cursor-move z-10 transition-transform active:scale-150 ${selectedBallId === ball.id ? 'ring-2 ring-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : ''}`}
                    >
                        {ball.id !== 'cue' && ball.id}
                    </div>
                ))}
                
                {balls.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-white/10 font-display text-sm text-center px-4 pointer-events-none">
                        DRAG BALLS FROM SIDEBAR
                    </div>
                )}
            </div>
          </div>
      </div>
      
      <div className="flex justify-between items-center mb-4 px-2">
          <div className="flex gap-2">
            <button onClick={() => setBalls([])} className="text-[10px] bg-red-900/50 text-red-200 px-3 py-1 rounded border border-red-800 flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> CLEAR
            </button>
            {selectedBallId && (
                <button onClick={() => removeBall(selectedBallId)} className="text-[10px] bg-slate-700 text-white px-3 py-1 rounded border border-slate-600">
                    DEL {selectedBallId}
                </button>
            )}
          </div>
          <p className="text-[10px] text-slate-500 italic font-bold">Vector Analysis: Enabled</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[100px] custom-scrollbar px-2">
        {response ? (
          <div className="bg-white text-slate-900 rounded-2xl rounded-tl-none p-4 shadow-2xl border-4 border-slate-300 relative animate-slide-up">
             <div className="absolute -top-3 left-0 bg-billiard-yellow px-3 py-1 rounded-full font-display text-[10px] font-bold border border-slate-900">
                STRATEGIC ANALYSIS
             </div>
             <p className="font-medium text-sm leading-relaxed mt-2 italic">"{response}"</p>
          </div>
        ) : (
          <div className="bg-slate-800/30 rounded-xl p-8 text-center border border-dashed border-slate-600 flex flex-col items-center justify-center h-full">
             <Info className="w-6 h-6 text-slate-600 mb-2" />
             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Setup the table for advice</p>
          </div>
        )}
        
        {loading && (
             <div className="text-center text-chalk font-display animate-pulse text-sm">
                RUNNING SIMULATIONS...
             </div>
        )}
      </div>

      <form onSubmit={handleAskCoach} className="bg-slate-900 p-2 rounded-2xl border-2 border-slate-700 flex gap-2 shadow-xl mx-2">
        <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about a specific shot..."
            className="flex-1 bg-transparent text-white pl-4 focus:outline-none placeholder:text-slate-600 font-bold text-sm"
        />
        <button
          type="submit"
          disabled={loading || (!query && balls.length === 0)}
          className="bg-chalk text-slate-900 p-3 rounded-xl hover:bg-white transition-colors disabled:opacity-30"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};