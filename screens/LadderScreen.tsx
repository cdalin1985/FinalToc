
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getUsers } from '../services/persistenceService';
import { Sword, Lock, Loader2 } from 'lucide-react';
import { ChallengeModal } from '../components/ChallengeModal';

interface LadderScreenProps {
  currentUser: User;
  onSelectOpponent: (opponent: User) => void;
}

export const LadderScreen: React.FC<LadderScreenProps> = ({ currentUser, onSelectOpponent }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalOpponent, setModalOpponent] = useState<User | null>(null);

  useEffect(() => {
    const fetch = async () => {
        const data = await getUsers();
        setUsers(data);
        setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-white w-8 h-8"/></div>;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-white text-outline drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
          THE LIST
        </h2>
        <div className="w-24 h-1 bg-billiard-red mx-auto mt-2 rounded-full"></div>
      </div>

      <div className="space-y-3">
        {users.sort((a,b) => a.rank - b.rank).map((user, index) => {
          const isMe = user.id === currentUser.id;
          
          // Determine ball color based on rank
          let ballColor = 'bg-billiard-yellow';
          if (user.rank === 2) ballColor = 'bg-blue-600';
          if (user.rank === 3) ballColor = 'bg-red-600';
          if (user.rank > 3) ballColor = 'bg-purple-600';
          if (user.rank === 8) ballColor = 'bg-black';

          // Challenge Logic: Can only challenge +/- 5 spots
          const rankDiff = Math.abs(user.rank - currentUser.rank);
          const canChallenge = !isMe && rankDiff <= 5;

          return (
            <div 
              key={user.id} 
              className={`relative flex items-center gap-4 p-3 rounded-xl border-b-4 transition-all shadow-lg ${
                isMe 
                  ? 'bg-felt-light border-green-800 translate-x-2' 
                  : 'bg-slate-800 border-slate-950'
              }`}
            >
              {/* Ball Rank */}
              <div className={`w-12 h-12 rounded-full ${ballColor} border-2 border-white/50 shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.4)] flex items-center justify-center flex-shrink-0`}>
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <span className="font-display font-bold text-black text-sm">{user.rank}</span>
                  </div>
              </div>
              
              {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.display_name} 
                    className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-600 flex-shrink-0"
                  />
              ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-700 border border-slate-600 flex-shrink-0"></div>
              )}
              
              <div className="flex-1 min-w-0">
                <h4 className={`font-display text-sm uppercase truncate ${isMe ? 'text-white' : 'text-slate-200'}`}>
                  {user.display_name}
                </h4>
                <div className="flex items-center gap-2">
                   <div className="h-1.5 w-16 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-chalk w-[80%]"></div>
                   </div>
                   <span className="text-[10px] font-bold text-chalk">{user.fargo_rate}</span>
                </div>
              </div>

              {!isMe && (
                <button 
                  onClick={() => {
                    if (!canChallenge) return;
                    setModalOpponent(user);
                    setShowModal(true);
                  }}
                  disabled={!canChallenge}
                  className={`p-2 rounded-lg border-b-2 transition-all ${
                    canChallenge 
                        ? 'bg-billiard-red border-red-900 active:border-b-0 active:translate-y-0.5 text-white cursor-pointer' 
                        : 'bg-slate-700 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  {canChallenge ? <Sword className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {showModal && modalOpponent && (
        <ChallengeModal
          currentUser={currentUser}
          opponent={modalOpponent}
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            onSelectOpponent(modalOpponent);
          }}
        />
      )}
    </div>
  );
};
