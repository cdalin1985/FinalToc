import React, { useState, useEffect } from 'react';
import { AuthScreen } from './screens/AuthScreen';
import { LadderScreen } from './screens/LadderScreen';
import { ChallengeScreen } from './screens/ChallengeScreen';
import { ActionBoardScreen as LeagueFeedScreen } from './screens/ActionBoardScreen';
import { NavBar } from './components/NavBar';
import { MascotOverlay } from './components/MascotOverlay';
import { User, ScreenName, Challenge } from './types';
import { Loader2, Sword, BellRing, Bell, Trophy, ShieldAlert, Activity, Clock, Zap, Target, CalendarDays } from 'lucide-react';
import { 
  initializeData, getCurrentUser, logoutUser, getUsers, 
  setCurrentUserSession, getUserActionItems, getFeed, subscribeToTable 
} from './services/persistenceService';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('auth');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedOpponent, setSelectedOpponent] = useState<User | null>(null);
  const [challengeStep, setChallengeStep] = useState<'terms' | 'logistics' | 'review'>('terms');
  const [activeChallenge, setActiveChallenge] = useState<Challenge | undefined>(undefined);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [pendingActionsCount, setPendingActionsCount] = useState(0);
  const [newFeedCount, setNewFeedCount] = useState(0);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const init = async () => {
        try {
            await initializeData();
            setIsLive(true);
            const savedUser = getCurrentUser();
            if (savedUser) {
              setCurrentUser(savedUser);
              setCurrentScreen('ladder');
              updateNotificationCounts(savedUser.id);
            }
        } catch (e) {
            console.error("Init failed", e);
        } finally {
            setIsAppLoading(false);
        }
    };
    init();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const unsubFeed = subscribeToTable('feed', () => {
        setNewFeedCount(prev => prev + 1);
        updateNotificationCounts(currentUser.id);
    });
    const unsubChallenges = subscribeToTable('challenges', () => {
        updateNotificationCounts(currentUser.id);
    });
    return () => {
        unsubFeed();
        unsubChallenges();
    };
  }, [currentUser]);

  const updateNotificationCounts = async (userId: string) => {
    const items = await getUserActionItems(userId);
    setPendingActionsCount(items.length);
  };

  const handleLogin = (user: User) => {
    setCurrentUserSession(user);
    setCurrentUser(user);
    setCurrentScreen('ladder');
    updateNotificationCounts(user.id);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('auth');
    logoutUser();
  };

  const handleNavigate = (screen: ScreenName) => {
    if (!currentUser && screen !== 'auth') {
      setCurrentScreen('auth');
      return;
    }
    setCurrentScreen(screen);
    if (screen === 'feed') setNewFeedCount(0);
    if (currentUser) updateNotificationCounts(currentUser.id);
  };

  const handleAcceptChallenge = async (challenge: Challenge) => {
      const allUsers = await getUsers();
      const isChallenger = challenge.challenger_id === currentUser?.id;
      const otherId = isChallenger ? challenge.opponent_id : challenge.challenger_id;
      const otherUser = allUsers.find(u => u.id === otherId);
      if (otherUser) {
          setSelectedOpponent(otherUser);
          setActiveChallenge(challenge);
          if (challenge.status === 'accepted') {
              setChallengeStep('review');
          } else {
              setChallengeStep(challenge.status === 'pending_logistics' ? 'logistics' : 'review');
          }
          setCurrentScreen('challenge');
      }
  };

  const renderContent = () => {
    if (!currentUser) return <AuthScreen onLogin={handleLogin} />;

    switch (currentScreen) {
      case 'ladder':
        return (
          <LadderScreen
            currentUser={currentUser}
            onSelectOpponent={(opponent) => {
              setSelectedOpponent(opponent);
              setActiveChallenge(undefined);
              setChallengeStep('terms');
              setCurrentScreen('challenge');
            }}
            onAcceptChallenge={handleAcceptChallenge}
          />
        );
      case 'challenge':
        return selectedOpponent ? (
          <ChallengeScreen
            currentUser={currentUser}
            opponent={selectedOpponent}
            challenge={activeChallenge}
            initialStep={challengeStep}
            onBack={() => setCurrentScreen('ladder')}
            onChallengeCreated={() => {
              setSelectedOpponent(null);
              setActiveChallenge(undefined);
              setCurrentScreen('ladder');
            }}
          />
        ) : <LadderScreen currentUser={currentUser} onSelectOpponent={setSelectedOpponent} onAcceptChallenge={handleAcceptChallenge} />;
      case 'feed':
        return <LeagueFeedScreen currentUser={currentUser} />;
      case 'profile':
        const isActiveMember = (currentUser.matches_this_month || 0) >= 2;
        return (
          <div className="flex flex-col animate-fade-in pb-32">
            <div className="flex items-center gap-6 mb-8 bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5">
                <div className="relative">
                    <div className="w-24 h-24 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-slate-800">
                        <img src={currentUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.display_name}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-billiard-yellow text-black font-display font-black px-3 py-1 rounded-full border-2 border-slate-950 shadow-lg text-xs">
                        {currentUser.fargo_rate}
                    </div>
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-display font-bold text-white uppercase italic tracking-tighter leading-none mb-1">{currentUser.display_name}</h2>
                    <div className="flex flex-wrap items-center gap-2">
                        {isActiveMember ? (
                            <span className="flex items-center gap-1 text-[8px] font-black bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20 uppercase tracking-widest">
                                <Activity className="w-2.5 h-2.5" /> Status: Active
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-[8px] font-black bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 uppercase tracking-widest animate-pulse">
                                <ShieldAlert className="w-2.5 h-2.5" /> At Risk
                            </span>
                        )}
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Rank #{currentUser.rank}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800 flex flex-col items-center">
                    <Trophy className="w-6 h-6 text-billiard-yellow mb-2" />
                    <div className="flex items-end gap-1">
                        <span className="text-2xl font-display text-white">{currentUser.wins || 0}</span>
                        <span className="text-[8px] text-slate-500 font-black uppercase mb-1.5">W</span>
                    </div>
                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Victory Count</span>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800 flex flex-col items-center">
                    <ShieldAlert className="w-6 h-6 text-billiard-red mb-2" />
                    <div className="flex items-end gap-1">
                        <span className="text-2xl font-display text-white">{currentUser.losses || 0}</span>
                        <span className="text-[8px] text-slate-500 font-black uppercase mb-1.5">L</span>
                    </div>
                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Defeat Count</span>
                </div>
            </div>

            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-4">Discipline Performance</h3>
            <div className="bg-slate-900/60 rounded-3xl border border-slate-800 divide-y divide-white/5 overflow-hidden mb-8">
                {Object.entries(currentUser.discipline_stats).map(([discipline, stats]) => {
                    const s = stats as { wins: number; losses: number };
                    return (
                        <div key={discipline} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Target className="w-4 h-4 text-chalk" />
                                <span className="font-display text-sm text-white uppercase italic">{discipline}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-black text-white">{s.wins}</span>
                                    <span className="text-[7px] text-slate-500 uppercase font-bold">WINS</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-black text-slate-500">{s.losses}</span>
                                    <span className="text-[7px] text-slate-500 uppercase font-bold">LOSSES</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-4">Engagement & Grind</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800">
                    <Sword className="w-5 h-5 text-billiard-red mb-3" />
                    <p className="text-xl font-display text-white">{currentUser.challenges_made || 0}</p>
                    <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Hunts Issued</p>
                </div>
                <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800">
                    <Zap className="w-5 h-5 text-cyan-400 mb-3" />
                    <p className="text-xl font-display text-white">{currentUser.challenges_accepted || 0}</p>
                    <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Wars Accepted</p>
                </div>
                <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 col-span-2 flex items-center justify-between">
                    <div>
                        <Clock className="w-5 h-5 text-chalk mb-1" />
                        <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Submission Velocity</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-display text-white">{currentUser.avg_submission_hours || 4.2}<span className="text-xs ml-1">hrs</span></p>
                        <p className="text-[7px] text-slate-500 uppercase font-black">Avg Time to Log</p>
                    </div>
                </div>
                <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 col-span-2">
                    <div className="flex items-center gap-2 mb-3">
                        <CalendarDays className="w-5 h-5 text-billiard-yellow" />
                        <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Preferred Grind Days</p>
                    </div>
                    <div className="flex gap-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className={`flex-1 py-1 rounded-lg text-center text-[9px] font-black border ${currentUser.preferred_days.includes(day) ? 'bg-billiard-yellow border-white text-black' : 'bg-slate-800/50 border-slate-700 text-slate-600 opacity-30'}`}>
                                {day[0]}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full bg-slate-800 text-slate-400 font-black py-4 rounded-2xl border border-slate-700 font-display text-[9px] tracking-[0.4em] uppercase hover:bg-slate-700 transition-all shadow-xl"
            >
              TERMINATE SESSION
            </button>
          </div>
        );
      default:
        return <LadderScreen currentUser={currentUser} onSelectOpponent={setSelectedOpponent} onAcceptChallenge={handleAcceptChallenge} />;
    }
  };

  if (isAppLoading) {
      return (
          <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 border-4 border-billiard-yellow border-t-transparent rounded-full animate-spin mb-6"></div>
                <span className="text-white font-display text-xs tracking-[0.5em] animate-pulse uppercase italic">Top of the Capital</span>
              </div>
          </div>
      )
  }

  return (
    <div className="fixed inset-0 bg-slate-950 bg-carbon text-white font-sans overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-felt opacity-30 bg-felt-texture pointer-events-none"></div>

      {currentUser && (
        <div className="h-20 bg-slate-950/80 backdrop-blur-md border-b border-white/5 flex justify-between items-center px-6 z-40 shadow-2xl relative">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentScreen('profile')}>
             <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border-2 border-slate-700 overflow-hidden shadow-xl group-hover:border-billiard-yellow transition-all">
                    <img src={currentUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.display_name}`} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-billiard-yellow rounded-full border border-black flex items-center justify-center font-display text-[8px] font-black shadow-md text-black">
                    {currentUser.fargo_rate}
                </div>
             </div>
             <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="font-display text-xs text-white uppercase tracking-wider">{currentUser.display_name}</span>
                    {isLive && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>}
                </div>
                <span className="text-[8px] font-black text-slate-500 mt-1 uppercase tracking-widest">Rank #{currentUser.rank} overall</span>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => handleNavigate('feed')} className="relative w-12 h-12 flex items-center justify-center bg-slate-900 border border-slate-700 rounded-xl shadow-lg active:scale-95 transition-all">
                <Bell className={`w-6 h-6 ${newFeedCount > 0 ? 'text-chalk' : 'text-slate-400'}`} />
                {newFeedCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-billiard-red text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-950">{newFeedCount}</span>}
             </button>
             {pendingActionsCount > 0 && (
                <button onClick={() => setCurrentScreen('ladder')} className="w-12 h-12 bg-billiard-red rounded-xl flex items-center justify-center border-b-4 border-red-900 animate-pulse relative shadow-xl">
                    <BellRing className="w-6 h-6 text-white" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-billiard-red text-[10px] font-black rounded-full flex items-center justify-center">{pendingActionsCount}</span>
                </button>
             )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scroll-smooth pb-24 relative z-10">
        <div className="min-h-full p-4 max-w-lg mx-auto md:max-w-2xl">
           {renderContent()}
        </div>
        {currentUser && <MascotOverlay />}
      </div>

      {currentUser && currentScreen !== 'auth' && (
        <NavBar currentScreen={currentScreen} onNavigate={handleNavigate} />
      )}
    </div>
  );
}

export default App;