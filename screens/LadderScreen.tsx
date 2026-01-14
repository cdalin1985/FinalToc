import React, { useState, useEffect } from 'react';
import { User, Challenge } from '../types';
import { getUsers, getUserActionItems } from '../services/persistenceService';
import { Sword, Loader2, BellRing, PlayCircle, CalendarDays, ShieldCheck, Zap } from 'lucide-react';

interface LadderScreenProps {
  currentUser: User;
  onSelectOpponent: (opponent: User) => void;
  onAcceptChallenge: (challenge: Challenge) => void;
}

export const LadderScreen: React.FC<LadderScreenProps> = ({ currentUser, onSelectOpponent, onAcceptChallenge }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [actionItems, setActionItems] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
        const [userData, challenges] = await Promise.all([
            getUsers(),
            getUserActionItems(currentUser.id)
        ]);
        setUsers(userData);
        setActionItems(challenges);
        setLoading(false);
    };
    fetch();
  }, [currentUser.id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-billiard-yellow border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-display text-slate-400 uppercase tracking-[0.3em] text-center">Synchronizing Eternal List...</span>
    </div>
  );

  const sortedUsers = [...users].sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* ACTION REQUIRED - PENDING CHALLENGES */}
      {actionItems.length > 0 && (
          <div className="bg-slate-900 border-2 border-billiard-red rounded-3xl p-4 shadow-2xl space-y-3 ring-4 ring-red-500/10">
              <h4 className="font-display text-[10px] text-billiard-red uppercase tracking-widest flex items-center gap-2">
                  <BellRing className="w-3 h-3 animate-pulse" /> Directives Pending
              </h4>
              {actionItems.map(challenge => {
                  const isAccepted = challenge.status === 'accepted';
                  const otherUser = users.find(u => u.id === (challenge.challenger_id === currentUser.id ? challenge.opponent_id : challenge.challenger_id));
                  return (
                      <div key={challenge.id} className="bg-slate-800 rounded-2xl p-3 flex items-center gap-3 border border-slate-700">
                          <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs text-white truncate">{otherUser?.display_name}</p>
                              <p className="text-[10px] text-slate-400">{isAccepted ? 'Ready to Start' : 'Terms Awaiting Review'}</p>
                          </div>
                          <button onClick={() => onAcceptChallenge(challenge)} className={`text-[10px] font-display px-4 py-2 rounded-xl border-b-4 active:border-b-0 active:translate-y-1 ${isAccepted ? 'bg-green-600 border-green-900 text-white' : 'bg-billiard-red border-red-900 text-white'}`}>
                             {isAccepted ? <PlayCircle className="w-4 h-4" /> : 'OPEN'}
                          </button>
                      </div>
                  )
              })}
          </div>
      )}

      {/* LIST HEADER */}
      <div className="text-center relative py-10 px-4 bg-slate-900/60 rounded-[2.5rem] border border-white/5 shadow-2xl mb-8">
        <h1 className="text-4xl font-display font-black text-white text-outline tracking-tighter uppercase leading-none italic">
          THE <span className="text-billiard-yellow">ETERNAL</span> LIST
        </h1>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3">Season 2025 // 70 Elite Members</p>
      </div>

      {/* THE LADDER */}
      <div className="space-y-4 px-1">
        {sortedUsers.map((user) => {
          const isMe = user.id === currentUser.id;
          const rankDiff = Math.abs(user.rank - currentUser.rank);
          const canChallenge = !isMe && rankDiff <= 5;
          const hasFargo = user.fargo_rate !== 0 && user.fargo_rate !== -90;

          return (
            <div key={user.id} className={`relative flex items-center gap-4 p-4 rounded-3xl border-b-4 transition-all duration-300 ${isMe ? 'bg-felt border-green-900 ring-2 ring-billiard-yellow/40 z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'bg-slate-900/80 border-slate-950 hover:bg-slate-800/90'}`}>
              
              {/* Rank Plate */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${isMe ? 'bg-white text-slate-900' : 'bg-slate-950 text-white border border-slate-700'}`}>
                <div className="flex flex-col items-center">
                   <span className="text-[8px] font-black opacity-50 uppercase leading-none mb-0.5">Rank</span>
                   <span className="font-display font-black text-lg leading-none">{user.rank}</span>
                </div>
              </div>

              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 flex-shrink-0 shadow-inner">
                  <img src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.display_name}`} className="w-full h-full object-cover" />
              </div>

              {/* Player Info & Stats */}
              <div className="flex-1 min-w-0">
                <h4 className={`font-display text-base uppercase italic truncate mb-1 ${isMe ? 'text-white' : 'text-slate-100'}`}>{user.display_name}</h4>
                <div className="flex flex-wrap items-center gap-2">
                   {hasFargo ? (
                       <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                          <Zap className="w-3 h-3 text-billiard-yellow" />
                          <span className="text-[10px] font-black text-billiard-yellow uppercase tracking-tighter">Fargo {user.fargo_rate}</span>
                       </div>
                   ) : (
                       <span className="text-[9px] font-black text-slate-500 bg-black/20 px-2 py-1 rounded-lg border border-white/5 uppercase tracking-widest italic">NEO</span>
                   )}
                   
                   {user.robustness !== undefined && user.robustness > 0 && (
                        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                          <ShieldCheck className="w-3 h-3 text-cyan-400" />
                          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-tighter">Rob {user.robustness}</span>
                        </div>
                   )}
                   
                   {user.preferred_days && user.preferred_days.length > 0 && (
                       <div className="flex items-center gap-1 text-[8px] text-slate-500 font-bold uppercase tracking-widest ml-1 opacity-60">
                           <CalendarDays className="w-3 h-3" /> {user.preferred_days.slice(0, 3).join(' ')}
                       </div>
                   )}
                </div>
              </div>

              {/* Action Button */}
              {!isMe && (
                <button 
                  onClick={() => canChallenge ? onSelectOpponent(user) : null}
                  className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all border-b-4 active:border-b-0 active:translate-y-1 ${canChallenge ? 'bg-billiard-red border-red-900 text-white shadow-xl shadow-red-900/20' : 'bg-slate-800 border-slate-900 text-slate-700 opacity-30 cursor-not-allowed'}`}
                >
                  <Sword className="w-5 h-5 mb-0.5" />
                  <span className="text-[8px] font-black italic uppercase tracking-tighter">{canChallenge ? 'HUNT' : 'LOCK'}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};