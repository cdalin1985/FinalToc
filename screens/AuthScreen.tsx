import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { User } from '../types';
import { getUsers, updateUser } from '../services/persistenceService';
import { Search, ArrowRight, CircleUserRound, LogIn, UserPlus, CalendarDays, Info, ShieldCheck, Zap } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [step, setStep] = useState<'select' | 'details' | 'availability' | 'avatar'>('select');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({ email: '', phone: '', password: '' });
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    getUsers().then(setAllUsers);
  }, []);

  const unclaimedUsers = allUsers.filter(u => !u.is_claimed && u.display_name.toLowerCase().includes(searchTerm.toLowerCase()));
  const claimedUsers = allUsers.filter(u => u.is_claimed && u.display_name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleUserSelect = (user: User) => {
    if (authMode === 'signin') {
      onLogin(user);
      return;
    }
    setSelectedUser(user);
    setAvatarUrl(user.avatar_url || null);
    setStep('details');
    setError(null);
  };

  const toggleDay = (day: string) => {
    setPreferredDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleFinalize = async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      const finalUser = { 
        ...selectedUser, 
        email: formData.email, 
        phone: formData.phone, 
        avatar_url: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.display_name}`, 
        is_claimed: true,
        preferred_days: preferredDays
      };
      await updateUser(finalUser);
      onLogin(finalUser);
    } catch (err: any) {
      console.error(err);
      setError("Failed to secure entry. System busy.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserList = (users: User[], emptyMsg: string) => (
    <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
      {users.length > 0 ? (
        users.map(user => (
          <button 
            key={user.id} 
            onClick={() => handleUserSelect(user)} 
            className="w-full text-left p-4 rounded-3xl bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/50 flex items-center justify-between group transition-all animate-slide-up"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 overflow-hidden border border-slate-700 flex-shrink-0">
                <img src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.display_name}`} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-display text-sm text-white block leading-tight truncate">{user.display_name}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Rank #{user.rank}</span>
                  {user.fargo_rate > 0 && (
                    <span className="text-[8px] text-billiard-yellow font-black uppercase tracking-tighter flex items-center gap-0.5">
                      <Zap className="w-2 h-2" /> Fargo {user.fargo_rate}
                    </span>
                  )}
                  {user.robustness !== undefined && user.robustness > 0 && (
                    <span className="text-[8px] text-cyan-400 font-black uppercase tracking-tighter flex items-center gap-0.5">
                      <ShieldCheck className="w-2 h-2" /> Rob {user.robustness}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-chalk group-hover:translate-x-1 transition-all flex-shrink-0" />
          </button>
        ))
      ) : (
        <div className="text-center py-12 px-4">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">{emptyMsg}</p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (step === 'select') {
      return (
        <div className="w-full max-w-md bg-slate-900/90 p-6 rounded-3xl border border-slate-700/50 shadow-2xl animate-fade-in backdrop-blur-xl">
           <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-slate-700 mb-4 shadow-inner">
              <button onClick={() => { setAuthMode('signup'); setStep('select'); setSearchTerm(''); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${authMode === 'signup' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><UserPlus className="w-3 h-3" /> Claim Spot</button>
              <button onClick={() => { setAuthMode('signin'); setStep('select'); setSearchTerm(''); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${authMode === 'signin' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><LogIn className="w-3 h-3" /> Log/Sign In</button>
           </div>
           
           <div className="px-4 mb-6 text-center">
              <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">
                {authMode === 'signup' 
                  ? "New initiates must select 'Claim Spot' to authenticate their position on the List. Subsequent access should be performed via the standard Sign In protocol."
                  : "Established competitors may synchronize via 'Log In' for immediate access to their active profiles."
                }
              </p>
           </div>

           <div className="relative mb-2">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
             <input type="text" placeholder={authMode === 'signup' ? "Filter unclaimed positions..." : "Filter active members..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-billiard-yellow transition-colors text-sm" />
           </div>
           {authMode === 'signup' ? renderUserList(unclaimedUsers, "No unclaimed positions match that query.") : renderUserList(claimedUsers, "No active members found.")}
        </div>
      );
    }

    if (step === 'details') {
      return (
        <div className="w-full max-w-md bg-slate-900/90 p-8 rounded-3xl border border-slate-700/50 shadow-2xl animate-fade-in backdrop-blur-xl">
             <div className="text-center mb-8">
                <h3 className="font-display text-2xl text-white uppercase italic tracking-tighter leading-none">Welcome, {selectedUser?.display_name}</h3>
                <p className="text-[10px] text-billiard-yellow font-black uppercase mt-2 tracking-widest">Rank #{selectedUser?.rank} Initialized</p>
             </div>
             <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-black uppercase ml-1 tracking-widest">Digital Address (Email)</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-4 px-4 text-white outline-none focus:border-chalk transition-all" placeholder="player@example.com" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-black uppercase ml-1 tracking-widest">Access Key (Password)</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-4 px-4 text-white outline-none focus:border-chalk transition-all" placeholder="••••••••" />
               </div>
               <div className="pt-4">
                <Button className="w-full py-5 text-base" onClick={() => setStep('availability')}>CONTINUE <ArrowRight className="w-5 h-5 ml-1" /></Button>
               </div>
             </div>
        </div>
      );
    }

    if (step === 'availability') {
        return (
            <div className="w-full max-w-md bg-slate-900/90 p-8 rounded-3xl border border-slate-700/50 shadow-2xl animate-fade-in backdrop-blur-xl">
                <div className="text-center mb-6">
                    <CalendarDays className="w-10 h-10 text-billiard-yellow mx-auto mb-4" />
                    <h3 className="font-display text-xl text-white uppercase italic tracking-tighter">Preferred Grind</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">When are you most likely to accept challenges?</p>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-8">
                    {DAYS.map(day => (
                        <button key={day} onClick={() => toggleDay(day)} className={`py-3 rounded-xl border-2 font-display text-[10px] transition-all ${preferredDays.includes(day) ? 'bg-billiard-yellow border-white text-black shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>{day}</button>
                    ))}
                </div>
                <Button className="w-full py-5" disabled={preferredDays.length === 0} onClick={() => setStep('avatar')}>LOCK AVAILABILITY</Button>
            </div>
        )
    }

    if (step === 'avatar') {
        return (
           <div className="w-full max-w-lg bg-slate-900/90 p-6 rounded-[2.5rem] border border-slate-700/50 shadow-2xl flex flex-col animate-fade-in backdrop-blur-xl">
              <h3 className="font-display text-xl text-white mb-6 text-center uppercase tracking-tighter italic">Character Identity</h3>
              <div className="flex justify-center mb-10 relative">
                  <div className="w-40 h-40 rounded-[2.5rem] border-4 border-billiard-yellow bg-slate-950 overflow-hidden relative shadow-[0_0_50px_rgba(255,179,0,0.2)]">
                      {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <CircleUserRound className="w-20 h-20 text-slate-800 mx-auto mt-10" />}
                  </div>
              </div>
              <Button onClick={handleFinalize} className="w-full py-5 text-lg" isLoading={isLoading}>CLAIM SPOT & START GRIND</Button>
           </div>
        );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] p-4">
      <div className="mb-10 text-center animate-fade-in relative">
          <h1 className="font-display text-6xl text-white text-outline italic uppercase tracking-tighter leading-none">TOP OF</h1>
          <h2 className="font-display text-5xl text-billiard-yellow text-outline uppercase tracking-tighter leading-none -mt-2">THE CAPITAL</h2>
      </div>
      {renderContent()}
    </div>
  );
};