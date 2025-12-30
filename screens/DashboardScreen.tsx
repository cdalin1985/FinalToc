
import React, { useState, useEffect } from 'react';
import { User, Challenge } from '../types';
import { TrendingUp, Trophy, Play, Star, ListOrdered, MessageSquare, Activity, BellRing, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { DailyQuest } from '../components/DailyQuest';
import { getUserActionItems, getUsers } from '../services/persistenceService';

interface DashboardScreenProps {
  currentUser: User;
  onNavigate: (screen: any) => void;
  onAcceptChallenge: (challenge: Challenge) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ currentUser, onNavigate, onAcceptChallenge }) => {
  const [actionItems, setActionItems] = useState<Challenge[]>([]);
  const [userCache, setUserCache] = useState<User[]>([]);

  useEffect(() => {
    const fetch = async () => {
        const loaded = await getUserActionItems(currentUser.id);
        setActionItems(loaded);
        const allUsers = await getUsers();
        setUserCache(allUsers);
    };
    fetch();
  }, [currentUser.id]);

  const getOtherUserName = (challenge: Challenge) => {
    // If I am challenger, show opponent name. If I am opponent, show challenger name.
    const otherId = challenge.challenger_id === currentUser.id ? challenge.opponent_id : challenge.challenger_id;
    return userCache.find(u => u.id === otherId)?.display_name || 'Unknown Player';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* PLAYER CARD */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 border-2 border-slate-600 shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-8 -mt-8"></div>
        
        <div className="flex items-center gap-6 relative z-10">
           <div className="relative">
             <div className="w-24 h-24 rounded-2xl bg-slate-700 border-4 border-billiard-yellow shadow-lg overflow-hidden">
                <img src={currentUser.avatar_url || 'https://i.pravatar.cc/150?u=pool_player'} className="w-full h-full object-cover" />
             </div>
             <div className="absolute -bottom-3 -right-3 bg-billiard-red w-10 h-10 rounded-full flex items-center justify-center border-2 border-white font-display font-bold shadow-md">
                {Math.floor(currentUser.fargo_rate / 10)}
             </div>
           </div>
           
           <div className="flex-1">
             <h2 className="text-2xl font-display font-bold text-white text-outline tracking-wider">{currentUser.display_name}</h2>
             <div className="flex items-center gap-2 mt-1">
                <span className="bg-felt-light px-2 py-0.5 rounded text-xs font-bold text-green-100 border border-green-400">PRO</span>
                <span className="text-slate-400 text-sm font-bold">Rank #{currentUser.rank}</span>
             </div>
             
             {/* XP Bar */}
             <div className="mt-3">
               <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                 <span>XP</span>
                 <span>{currentUser.fargo_rate} / 1000</span>
               </div>
               <div className="h-3 bg-slate-950 rounded-full border border-slate-700 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-billiard-yellow to-orange-500 w-[65%] shadow-[0_0_10px_rgba(255,179,0,0.5)]"></div>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* LIVE EVENT BANNER */}
      <div 
        onClick={() => onNavigate('stream')}
        className="bg-billiard-black rounded-2xl border-2 border-slate-700 p-1 cursor-pointer hover:border-chalk transition-colors group"
      >
         <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 flex justify-between items-center relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            
            <div className="relative z-10">
               <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-bold text-red-500 uppercase">Live Event</span>
               </div>
               <h3 className="font-display text-xl italic text-white">HAMPER <span className="text-chalk">VS</span> PALIGA</h3>
            </div>
            
            <div className="relative z-10 bg-chalk text-slate-900 p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
               <Play className="w-6 h-6 fill-current" />
            </div>
         </div>
      </div>

      {/* GAME MODES / QUICK ACTIONS */}
      <div className="grid grid-cols-2 gap-4">
        <button 
            className="bg-gradient-to-br from-purple-600 to-purple-800 p-4 rounded-2xl border-b-4 border-purple-900 active:border-b-0 active:translate-y-1 transition-all shadow-lg flex flex-col items-center justify-center gap-2 h-32"
            onClick={() => onNavigate('ladder')}
        >
            <ListOrdered className="w-10 h-10 text-white drop-shadow-md" />
            <span className="font-display text-lg text-white text-outline">THE LIST</span>
        </button>
        <button 
             className="bg-gradient-to-br from-orange-500 to-orange-700 p-4 rounded-2xl border-b-4 border-orange-900 active:border-b-0 active:translate-y-1 transition-all shadow-lg flex flex-col items-center justify-center gap-2 h-32"
             onClick={() => onNavigate('action-board')}
        >
            <Activity className="w-10 h-10 text-white drop-shadow-md" />
            <span className="font-display text-lg text-white text-outline">ACTION BOARD</span>
        </button>
      </div>
      
      {/* DAILY QUEST */}
      <DailyQuest />

      {/* NOTIFICATIONS / ACTION ITEMS */}
      <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-4 border border-slate-700">
         <h4 className="font-display text-sm text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
             <BellRing className="w-4 h-4" /> Action Required
         </h4>
         
         {actionItems.length > 0 ? (
             <div className="space-y-3">
                 {actionItems.map(challenge => {
                    const isMyTurnToSetLogistics = challenge.status === 'pending_logistics';
                    return (
                        <div key={challenge.id} className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl border border-slate-700 shadow-md">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs text-center p-1 leading-none shadow-sm ${isMyTurnToSetLogistics ? 'bg-billiard-red' : 'bg-green-600'}`}>
                                {isMyTurnToSetLogistics ? 'VS' : <Clock className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-sm text-white">{getOtherUserName(challenge)}</p>
                                <p className="text-xs text-slate-400">
                                    {isMyTurnToSetLogistics 
                                        ? `Challenge: Race to ${challenge.race_to} (${challenge.discipline})`
                                        : 'Waiting for your confirmation on time.'
                                    }
                                </p>
                            </div>
                            <Button size="sm" onClick={() => onAcceptChallenge(challenge)} className="px-3 py-1 text-xs h-auto shadow-sm">
                                {isMyTurnToSetLogistics ? 'Accept' : 'Confirm'}
                            </Button>
                        </div>
                    );
                 })}
             </div>
         ) : (
             <div className="text-center py-6 text-slate-500 text-sm italic">
                 No pending actions. Go find a match on The List!
             </div>
         )}
      </div>
    </div>
  );
};
