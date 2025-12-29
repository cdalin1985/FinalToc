import React from 'react';
import { MOCK_MATCHES } from '../services/mockData';
import { Eye } from 'lucide-react';

export const StreamScreen: React.FC = () => {
  const match = MOCK_MATCHES[0];

  return (
    <div className="h-full flex flex-col animate-fade-in -mx-4 -my-4 md:mx-0 md:my-0 md:h-auto">
      {/* VIDEO PLAYER */}
      <div className="relative aspect-video bg-slate-950 flex items-center justify-center group overflow-hidden border-b-4 border-billiard-yellow shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
        
        {/* Score Bug */}
        <div className="absolute top-4 left-4 z-20 flex shadow-lg">
           <div className="bg-slate-900 text-white font-display font-bold px-3 py-1 border-r border-slate-700 flex flex-col items-center justify-center min-w-[60px]">
              <span className="text-xs text-slate-400">P1</span>
              <span className="text-xl">{match.score1}</span>
           </div>
           <div className="bg-white text-black font-display font-bold px-3 py-1 flex flex-col items-center justify-center min-w-[60px]">
              <span className="text-xs text-slate-500">P2</span>
              <span className="text-xl">{match.score2}</span>
           </div>
           <div className="bg-billiard-red text-white font-display text-xs font-bold px-2 py-1 flex items-center">
              RACE TO 11
           </div>
        </div>
        
        <div className="absolute bottom-4 left-4 z-20">
            <h1 className="text-white font-display font-bold text-2xl text-outline drop-shadow-md italic">{match.player1.display_name} vs {match.player2.display_name}</h1>
            <div className="flex items-center gap-2 text-chalk font-bold text-sm bg-black/50 px-2 rounded-md w-fit">
               <Eye className="w-3 h-3" /> {match.viewers.toLocaleString()} Viewers
            </div>
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 bg-slate-900 flex flex-col">
        <div className="p-2 bg-slate-800 border-b border-slate-700 flex justify-between items-center px-4">
           <span className="font-display text-sm text-white">LIVE CHAT</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex gap-2">
            <span className="font-bold text-chalk text-sm">PoolShark99:</span>
            <span className="text-slate-300 text-sm">That bank shot was INSANE! 🔥</span>
          </div>
          <div className="flex gap-2">
            <span className="font-bold text-billiard-yellow text-sm">Admin:</span>
            <span className="text-slate-300 text-sm">Welcome to the finals!</span>
          </div>
          <div className="flex gap-2 opacity-50">
            <span className="font-bold text-green-400 text-sm">Guest1:</span>
            <span className="text-slate-300 text-sm">gg</span>
          </div>
        </div>
        
        <div className="p-4 bg-slate-800 border-t border-slate-700 pb-24 md:pb-4">
            <div className="flex gap-2">
                <input type="text" placeholder="Say something..." className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-chalk" />
                <button className="bg-chalk text-black font-display font-bold px-4 rounded-lg hover:bg-white uppercase text-sm">Chat</button>
            </div>
        </div>
      </div>
    </div>
  );
};