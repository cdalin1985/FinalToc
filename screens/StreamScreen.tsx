import React, { useState } from 'react';
// Corrected import to use INITIAL_MATCHES from mockData as MOCK_MATCHES was not exported
import { INITIAL_MATCHES } from '../services/mockData';
import { Eye, Plus, Minus, UserCircle, Trophy, Radio } from 'lucide-react';

export const StreamScreen: React.FC = () => {
  // Using the correctly imported INITIAL_MATCHES
  const match = INITIAL_MATCHES[0];
  const [score1, setScore1] = useState(match.score1);
  const [score2, setScore2] = useState(match.score2);
  const [isBroadcasting, setIsBroadcasting] = useState(true);

  return (
    <div className="h-full flex flex-col animate-fade-in -mx-4 -my-4 md:mx-0 md:my-0 md:h-auto pb-24">
      {/* VIDEO PLAYER / BROADCAST VIEW */}
      <div className="relative aspect-video bg-slate-950 flex items-center justify-center group overflow-hidden border-b-4 border-billiard-yellow shadow-2xl">
        {/* Simulating Camera Feed Background */}
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
             <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
             <div className="absolute flex flex-col items-center gap-4">
                <Radio className="w-16 h-16 text-slate-800 animate-pulse" />
                <span className="font-display text-slate-700 uppercase tracking-widest italic">The Whisper Relay Active</span>
             </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 z-10"></div>
        
        {/* Score Bug (Broadcast Style) */}
        <div className="absolute top-4 left-4 z-20 flex shadow-2xl scale-75 origin-top-left sm:scale-100">
           <div className="bg-slate-900 text-white font-display font-bold px-4 py-2 border-r-2 border-slate-700 flex flex-col items-center justify-center min-w-[80px]">
              <span className="text-[10px] text-slate-500 uppercase tracking-tighter">DAN</span>
              <span className="text-3xl text-outline">{score1}</span>
           </div>
           <div className="bg-white text-black font-display font-bold px-4 py-2 flex flex-col items-center justify-center min-w-[80px]">
              <span className="text-[10px] text-slate-400 uppercase tracking-tighter">MIKE</span>
              <span className="text-3xl">{score2}</span>
           </div>
           <div className="bg-billiard-red text-white font-display text-[10px] font-black px-3 py-1 flex items-center italic tracking-widest border-l-2 border-black/10">
              RACE TO 11
           </div>
        </div>

        {/* Live Indicator */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full border border-white/20 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Live</span>
        </div>
        
        <div className="absolute bottom-4 left-4 z-20">
            <h1 className="text-white font-display font-bold text-2xl text-outline drop-shadow-md italic uppercase tracking-tighter">
                {match.player1.display_name} <span className="text-billiard-yellow">VS</span> {match.player2.display_name}
            </h1>
            <div className="flex items-center gap-2 text-chalk font-black text-[10px] bg-black/50 px-2 py-0.5 rounded-md w-fit uppercase tracking-widest border border-white/5">
               <Eye className="w-3 h-3" /> {match.viewers.toLocaleString()} Watching
            </div>
        </div>
      </div>

      {/* INTERACTIVE SCOREBOARD (FOR PLAYERS) */}
      <div className="p-4 bg-slate-900 border-b border-white/5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-xs text-slate-500 uppercase tracking-widest italic">Touch-Score Interface</h4>
            <span className="text-[8px] text-billiard-yellow font-bold uppercase border border-billiard-yellow/20 px-2 py-0.5 rounded">Player Control Mode</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 h-32">
              <div className="bg-slate-800 rounded-3xl border-2 border-slate-700 flex items-center overflow-hidden shadow-xl">
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase">P1 Score</span>
                    <span className="text-4xl font-display text-white">{score1}</span>
                  </div>
                  <div className="w-16 h-full flex flex-col border-l border-slate-700">
                    <button onClick={() => setScore1(s => s + 1)} className="flex-1 bg-green-600/20 flex items-center justify-center hover:bg-green-600/40 transition-colors">
                        <Plus className="w-6 h-6 text-green-400" />
                    </button>
                    <button onClick={() => setScore1(s => Math.max(0, s - 1))} className="flex-1 bg-red-600/20 flex items-center justify-center hover:bg-red-600/40 transition-colors">
                        <Minus className="w-6 h-6 text-red-400" />
                    </button>
                  </div>
              </div>

              <div className="bg-slate-800 rounded-3xl border-2 border-slate-700 flex items-center overflow-hidden shadow-xl">
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase">P2 Score</span>
                    <span className="text-4xl font-display text-white">{score2}</span>
                  </div>
                  <div className="w-16 h-full flex flex-col border-l border-slate-700">
                    <button onClick={() => setScore2(s => s + 1)} className="flex-1 bg-green-600/20 flex items-center justify-center hover:bg-green-600/40 transition-colors">
                        <Plus className="w-6 h-6 text-green-400" />
                    </button>
                    <button onClick={() => setScore2(s => Math.max(0, s - 1))} className="flex-1 bg-red-600/20 flex items-center justify-center hover:bg-red-600/40 transition-colors">
                        <Minus className="w-6 h-6 text-red-400" />
                    </button>
                  </div>
              </div>
          </div>
      </div>

      {/* CHAT / COMMENTARY FEED */}
      <div className="flex-1 bg-slate-950 flex flex-col">
        <div className="p-3 bg-slate-900 border-b border-white/5 flex justify-between items-center px-6">
           <div className="flex items-center gap-2">
                <Radio className="w-3 h-3 text-billiard-red animate-pulse" />
                <span className="font-display text-[10px] text-white uppercase tracking-widest italic">Live Commentary Relay</span>
           </div>
           <button className="text-[10px] font-black text-slate-500 uppercase hover:text-white">Refresh</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
          <div className="flex gap-3 items-start animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-billiard-yellow flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4 text-black" />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-billiard-yellow text-[10px] uppercase tracking-tighter">The Whisper:</span>
                <span className="text-slate-200 text-sm leading-relaxed italic">"Hamper is lining up a delicate cut on the 7-ball. This rack could go either way."</span>
            </div>
          </div>
          
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                <UserCircle className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-chalk text-[10px] uppercase tracking-tighter">PoolShark99:</span>
                <span className="text-slate-400 text-sm">Hamper's position play is world-class today. 🔥</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-slate-900 border-t border-white/5">
            <div className="flex gap-2">
                <input type="text" placeholder="Engage with the stream..." className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-billiard-yellow transition-all" />
                <button className="bg-billiard-yellow text-black font-display font-black px-6 rounded-2xl hover:bg-white uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">Send</button>
            </div>
        </div>
      </div>
    </div>
  );
};