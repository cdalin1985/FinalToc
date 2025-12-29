
import React, { useState, useEffect } from 'react';
import { AuthScreen } from './screens/AuthScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { LadderScreen } from './screens/LadderScreen';
import { ChallengeScreen } from './screens/ChallengeScreen';
import { StreamScreen } from './screens/StreamScreen';
import { CoachScreen } from './screens/CoachScreen';
import { ActionBoardScreen } from './screens/ActionBoardScreen';
import { PaymentScreen } from './screens/PaymentScreen';
import { NavBar } from './components/NavBar';
import { MascotOverlay } from './components/MascotOverlay';
import { User, ScreenName, Challenge } from './types';
import { CircleDollarSign, ArrowLeft, LogOut, Loader2 } from 'lucide-react';
import { initializeData, getCurrentUser, logoutUser, getUsers, setCurrentUserSession } from './services/persistenceService';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('auth');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedOpponent, setSelectedOpponent] = useState<User | null>(null);
  const [challengeStep, setChallengeStep] = useState<'terms' | 'logistics' | 'review'>('terms');
  const [activeChallenge, setActiveChallenge] = useState<Challenge | undefined>(undefined);
  const [isAppLoading, setIsAppLoading] = useState(true);

  // Check for remembered user on mount and init data
  useEffect(() => {
    const init = async () => {
        try {
            await initializeData();
            const savedUser = getCurrentUser();
            if (savedUser) {
              setCurrentUser(savedUser);
              setCurrentScreen('dashboard');
            }
        } catch (e) {
            console.error("Init failed", e);
        } finally {
            setIsAppLoading(false);
        }
    };
    init();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUserSession(user); // Persist session
    setCurrentUser(user);
    setCurrentScreen('dashboard');
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
  };

  const handleBack = () => {
      if (currentScreen === 'challenge') {
          if (challengeStep !== 'terms') {
             setCurrentScreen('dashboard');
          } else {
             setCurrentScreen('ladder');
          }
      } else if (currentScreen === 'payment') {
          setCurrentScreen('dashboard');
      } else {
          setCurrentScreen('dashboard');
      }
  };

  const handleAcceptChallenge = async (challenge: Challenge) => {
      const allUsers = await getUsers(); // Now async
      
      const isChallenger = challenge.challenger_id === currentUser?.id;
      const otherId = isChallenger ? challenge.opponent_id : challenge.challenger_id;
      const otherUser = allUsers.find(u => u.id === otherId);
      
      if (otherUser) {
          setSelectedOpponent(otherUser);
          setActiveChallenge(challenge);
          
          if (challenge.status === 'pending_logistics') {
             setChallengeStep('logistics');
          } else if (challenge.status === 'pending_confirmation') {
             setChallengeStep('review');
          }
          
          setCurrentScreen('challenge');
      }
  };

  const renderContent = () => {
    if (!currentUser) {
      return <AuthScreen onLogin={handleLogin} />;
    }

    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen currentUser={currentUser} onNavigate={handleNavigate} onAcceptChallenge={handleAcceptChallenge} />;
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
          />
        );
      case 'challenge':
        return selectedOpponent ? (
          <ChallengeScreen
            currentUser={currentUser}
            opponent={selectedOpponent}
            challenge={activeChallenge}
            initialStep={challengeStep}
            onBack={handleBack}
            onChallengeCreated={() => {
              setSelectedOpponent(null);
              setActiveChallenge(undefined);
              setCurrentScreen('dashboard');
            }}
          />
        ) : (
          <LadderScreen currentUser={currentUser} onSelectOpponent={(opponent) => {
              setSelectedOpponent(opponent);
              setChallengeStep('terms');
              setCurrentScreen('challenge');
          }} />
        );
      case 'stream':
        return <StreamScreen />;
      case 'coach':
        return <CoachScreen currentUser={currentUser} />;
      case 'action-board':
        return <ActionBoardScreen currentUser={currentUser} />;
      case 'payment':
        return <PaymentScreen onBack={handleBack} />;
      case 'profile':
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden">
                <img src={currentUser.avatar_url} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 bg-billiard-yellow text-black font-display font-bold px-4 py-1 rounded-full border-2 border-white shadow-lg">
                LEVEL {Math.floor(currentUser.fargo_rate / 100)}
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-white text-outline">{currentUser.display_name}</h2>
              <p className="text-slate-300 font-bold mt-2">Member ID: #{currentUser.id}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-billiard-red text-white font-bold py-3 px-8 rounded-xl shadow-[0_4px_0_#7f1d1d] active:shadow-none active:translate-y-[4px] border-2 border-red-400"
            >
              LOGOUT
            </button>
          </div>
        );
      default:
        return <DashboardScreen currentUser={currentUser} onNavigate={handleNavigate} onAcceptChallenge={handleAcceptChallenge} />;
    }
  };

  if (isAppLoading) {
      return (
          <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-billiard-yellow animate-spin" />
              <span className="ml-3 text-white font-display">CONNECTING TO LEAGUE...</span>
          </div>
      )
  }

  return (
    <div className="fixed inset-0 bg-felt bg-felt-texture text-white font-sans overflow-hidden flex flex-col">
      {/* Top Game Bar */}
      {currentUser && (
        <div className="h-14 bg-slate-900 border-b border-slate-700 flex justify-between items-center px-4 z-40 shadow-lg relative">
          <div className="flex items-center gap-2">
            {currentScreen !== 'dashboard' && (
                <button onClick={handleBack} className="p-1 bg-slate-800 rounded-full border border-slate-600 hover:bg-slate-700 mr-2">
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>
            )}
            
            <div className={`flex items-center gap-2 bg-slate-800 rounded-full px-3 py-1 border border-slate-600 hidden xs:flex`}>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-200">ONLINE</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
                onClick={() => handleNavigate('payment')}
                className="flex items-center gap-1 text-billiard-yellow hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700 px-3 py-1 rounded-full border border-transparent hover:border-slate-500"
                title="Pay Dues"
             >
                <CircleDollarSign className="w-5 h-5 fill-current" />
                <span className="font-display font-bold">1,250</span>
             </button>
             
             <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors" title="Sign Out">
                 <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto scroll-smooth pb-24 md:pb-0 md:pr-24 relative">
        <div className="min-h-full p-4 max-w-lg mx-auto md:max-w-2xl">
           {renderContent()}
        </div>
        
        {/* Mascots appear here */}
        {currentUser && <MascotOverlay />}
      </div>

      {/* Navigation */}
      {currentUser && currentScreen !== 'auth' && (
        <NavBar currentScreen={currentScreen} onNavigate={handleNavigate} />
      )}
    </div>
  );
}

export default App;