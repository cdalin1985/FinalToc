import React, { useState, useEffect } from 'react';
import { User, Venue, Challenge } from '../types';
import { Button } from '../components/Button';
import { ArrowLeft, MapPin, Calendar, CheckCircle2, BellRing, ArrowRight, Shield, Sword, ThumbsUp, XCircle } from 'lucide-react';
import { saveChallenge } from '../services/persistenceService';

interface ChallengeScreenProps {
  currentUser: User;
  opponent: User;
  challenge?: Challenge; // Pass the challenge object if reacting to one
  onBack: () => void;
  onChallengeCreated: () => void;
  initialStep?: 'terms' | 'logistics' | 'review';
}

type ChallengeStep = 'terms' | 'waiting' | 'logistics' | 'review' | 'confirmation';

export const ChallengeScreen: React.FC<ChallengeScreenProps> = ({ 
  currentUser, 
  opponent, 
  challenge,
  onBack, 
  onChallengeCreated,
  initialStep = 'terms' 
}) => {
  const [step, setStep] = useState<ChallengeStep>(initialStep);
  const [raceTo, setRaceTo] = useState(7);
  const [discipline, setDiscipline] = useState('9-ball');
  
  // Logistics State 
  const [venue, setVenue] = useState<Venue | null>(null);
  const [dateTime, setDateTime] = useState('');
  
  // Initialize state from existing challenge if provided
  useEffect(() => {
    if (challenge) {
        setRaceTo(challenge.race_to);
        setDiscipline(challenge.discipline);
        if (challenge.venue) setVenue(challenge.venue);
        if (challenge.scheduled_time) setDateTime(challenge.scheduled_time);
    } else {
        // Defaults for fresh challenge
        setRaceTo(9);
        setDiscipline('9-ball');
    }
  }, [challenge]);

  // Step 1: Challenger sends terms
  const handleSendChallenge = async () => {
     const newChallenge: Challenge = {
         id: `c_${Date.now()}`,
         challenger_id: currentUser.id,
         opponent_id: opponent.id,
         discipline: discipline as any,
         race_to: raceTo,
         status: 'pending_logistics',
         created_at: new Date().toISOString()
     };
     saveChallenge(newChallenge);
     setStep('waiting');
  };

  // Step 2: Opponent sets logistics
  const handleProposeLogistics = () => {
    if (!challenge) return;
    
    const updatedChallenge: Challenge = {
        ...challenge,
        venue: venue!,
        scheduled_time: dateTime,
        status: 'pending_confirmation' // Goes back to challenger
    };
    saveChallenge(updatedChallenge);
    setStep('waiting'); // Waiting for Challenger to confirm
  };

  // Step 3: Challenger confirms everything
  const handleFinalConfirm = () => {
      if (!challenge) return;

      const finalChallenge: Challenge = {
          ...challenge,
          status: 'accepted'
      };
      saveChallenge(finalChallenge);
      setStep('confirmation'); // Show success animation
  };

  if (step === 'waiting') {
      const isLogistics = initialStep === 'logistics';
      return (
          <div className="h-full flex flex-col items-center justify-center animate-fade-in text-center space-y-6">
             <div className="relative">
                 <div className="w-24 h-24 rounded-full border-4 border-slate-700 flex items-center justify-center bg-slate-800">
                     <BellRing className="w-10 h-10 text-billiard-yellow animate-ping" />
                 </div>
                 <div className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
             </div>
             <div>
                <h2 className="font-display text-2xl text-white">SENT!</h2>
                <p className="text-slate-400 mt-2">
                    {isLogistics 
                        ? `Time & Venue proposed. Waiting for ${opponent.display_name} to confirm.` 
                        : `Challenge sent to ${opponent.display_name}.`
                    }
                </p>
                <p className="text-slate-500 text-xs mt-4 max-w-[200px] mx-auto">You will be notified when they respond.</p>
             </div>
             <Button onClick={onChallengeCreated} className="mt-8">BACK TO DASHBOARD</Button>
          </div>
      )
  }

  if (step === 'confirmation') {
      return (
        <div className="h-full flex flex-col items-center justify-center animate-fade-in text-center space-y-6">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.5)] animate-[bounce_1s_ease-in-out]">
                <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <div>
                <h2 className="font-display text-3xl text-white">IT'S ON!</h2>
                <p className="text-slate-400 mt-2">Match confirmed and posted to the league.</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-600 w-full shadow-lg">
                <div className="flex justify-between border-b border-slate-700 pb-2 mb-2">
                    <span className="text-slate-400 text-sm">VS</span>
                    <span className="font-bold text-white">{opponent.display_name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2 mb-2">
                    <span className="text-slate-400 text-sm">Game</span>
                    <span className="font-bold text-billiard-yellow">{discipline} - Race to {raceTo}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2 mb-2">
                    <span className="text-slate-400 text-sm">Venue</span>
                    <span className="font-bold text-white">{venue}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Time</span>
                    <span className="font-bold text-white">{new Date(dateTime).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</span>
                </div>
            </div>
            <Button onClick={onChallengeCreated} className="w-full">RETURN TO DASHBOARD</Button>
        </div>
      );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-4">
        {step !== 'terms' ? (
             <div className="w-9"></div> 
        ) : (
             <button onClick={onBack} className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 border border-slate-600 transition-colors">
                <ArrowLeft className="w-5 h-5 text-white" />
            </button>
        )}
       
        <span className="font-display text-lg text-slate-300">
            {step === 'terms' ? 'STEP 1: TERMS' : step === 'logistics' ? 'STEP 2: LOGISTICS' : 'STEP 3: CONFIRM'}
        </span>
        <div className="w-9"></div> 
      </div>

      {/* PROGRESS INDICATOR */}
      <div className="flex items-center gap-2 mb-6">
          <div className={`flex-1 h-2 rounded-full ${step === 'terms' ? 'bg-billiard-yellow' : 'bg-green-500'}`}></div>
          <div className={`flex-1 h-2 rounded-full ${step === 'logistics' ? 'bg-billiard-yellow' : step === 'review' ? 'bg-green-500' : 'bg-slate-800'}`}></div>
          <div className={`flex-1 h-2 rounded-full ${step === 'review' ? 'bg-billiard-yellow' : 'bg-slate-800'}`}></div>
      </div>

      {/* VS VISUAL */}
      <div className={`relative ${step === 'terms' ? 'h-40' : 'h-24'} mb-6 transition-all duration-500`}>
         <div className="absolute left-0 top-0 bottom-0 w-[55%] bg-slate-800 skew-x-12 -ml-4 overflow-hidden border-r-4 border-billiard-yellow z-10">
            <img src={currentUser.avatar_url} className="w-full h-full object-cover opacity-60 skew-x-[-12deg] scale-125" />
            <div className="absolute bottom-2 left-8 -skew-x-12 font-bold text-white text-xs bg-black/50 px-2 rounded">YOU</div>
         </div>
         <div className="absolute right-0 top-0 bottom-0 w-[55%] bg-billiard-red skew-x-12 -mr-4 overflow-hidden border-l-4 border-white">
            <img src={opponent.avatar_url} className="w-full h-full object-cover opacity-60 skew-x-[-12deg] scale-125" />
            <div className="absolute bottom-2 right-8 -skew-x-12 font-bold text-white text-xs bg-black/50 px-2 rounded">RIVAL</div>
         </div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-slate-900 shadow-xl">
            <span className="font-display font-black text-lg text-slate-900 italic">VS</span>
         </div>
      </div>

      {step === 'terms' && (
          <div className="space-y-6 flex-1 bg-slate-900/50 p-6 rounded-3xl border border-slate-700 backdrop-blur-sm shadow-xl">
            {/* ... Term Selection Controls (Existing) ... */}
            <div className="flex items-center gap-2 mb-2 text-billiard-yellow font-bold text-xs uppercase tracking-wider">
                <Sword className="w-4 h-4" /> Challenger Controls
            </div>
            
            <div>
            <label className="block font-display text-sm text-chalk mb-3 uppercase tracking-wider">Discipline</label>
            <div className="grid grid-cols-3 gap-3">
                {['8-ball', '9-ball', '10-ball'].map((d) => (
                <button
                    key={d}
                    onClick={() => setDiscipline(d)}
                    className={`py-3 px-2 rounded-xl font-display text-xs sm:text-sm transition-all border-b-4 active:border-b-0 active:translate-y-1 ${
                    discipline === d 
                        ? 'bg-billiard-yellow border-orange-600 text-black shadow-lg' 
                        : 'bg-slate-700 border-slate-900 text-slate-400'
                    }`}
                >
                    {d}
                </button>
                ))}
            </div>
            </div>

            <div>
            <div className="flex justify-between items-center mb-2">
                <label className="font-display text-sm text-chalk uppercase tracking-wider">Race To</label>
                <span className="font-display text-4xl text-white">{raceTo}</span>
            </div>
            <div className="h-12 bg-slate-800 rounded-xl p-2 flex items-center border border-slate-600 relative">
                <div className="absolute left-4 right-4 h-2 bg-slate-600 rounded-full"></div>
                <div 
                    className="absolute h-2 bg-billiard-yellow rounded-full" 
                    style={{ left: '16px', right: `${100 - ((raceTo - 5) / 10) * 100}%`, maxWidth: 'calc(100% - 32px)'}} 
                />
                <input 
                    type="range" 
                    min="5" 
                    max="15" 
                    value={raceTo} 
                    onChange={(e) => setRaceTo(parseInt(e.target.value))}
                    className="w-full z-10 opacity-0 cursor-pointer h-full"
                />
                <div 
                    className="absolute w-8 h-8 bg-white rounded-full shadow-lg border-4 border-slate-900 flex items-center justify-center pointer-events-none transition-all"
                    style={{ left: `calc(${((raceTo - 5) / 10) * 100}% - 16px + ${16 - (((raceTo - 5) / 10) * 32)}px)` }}
                >
                    <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                </div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-bold px-1 mt-1">
                <span>SHORT (5)</span>
                <span>MARATHON (15)</span>
            </div>
            </div>

            <div className="pt-4 mt-auto">
                <Button onClick={handleSendChallenge} className="w-full py-4 text-xl shadow-[0_0_30px_rgba(229,57,53,0.3)] group" variant="danger">
                    SEND CHALLENGE <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </div>
      )}

      {step === 'logistics' && (
        <div className="space-y-6 flex-1 bg-slate-900/50 p-6 rounded-3xl border border-slate-700 backdrop-blur-sm animate-fade-in shadow-xl">
             <div className="flex items-center gap-2 mb-2 text-green-400 font-bold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4" /> Opponent Controls
             </div>

             <div className="bg-slate-800/50 border border-slate-600 p-3 rounded-xl text-slate-300 text-sm mb-4 flex gap-3 items-center">
                 <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                     <BellRing className="w-5 h-5 text-billiard-yellow" />
                 </div>
                 <p className="italic">"{opponent.display_name} has challenged you to a race to {raceTo}! Select a venue and time to accept."</p>
             </div>

             {/* VENUE SELECTOR */}
             <div>
                <label className="block font-display text-sm text-chalk mb-3 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Select Venue
                </label>
                <div className="grid grid-cols-1 gap-3">
                    {['Eagles 4040', 'Valley Hub'].map((v) => (
                        <button
                            key={v}
                            onClick={() => setVenue(v as Venue)}
                            className={`py-4 px-4 rounded-xl font-display text-lg transition-all border-b-4 active:border-b-0 active:translate-y-1 text-left flex justify-between items-center ${
                            venue === v 
                                ? 'bg-felt text-white border-green-800 shadow-lg' 
                                : 'bg-slate-700 border-slate-900 text-slate-400'
                            }`}
                        >
                            {v}
                            {venue === v && <CheckCircle2 className="w-6 h-6 text-white" />}
                        </button>
                    ))}
                </div>
             </div>

             {/* DATE PICKER */}
             <div>
                 <label className="block font-display text-sm text-chalk mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Schedule Date
                 </label>
                 <input 
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full bg-slate-800 border-2 border-slate-600 rounded-xl p-4 text-white text-lg font-bold focus:border-chalk outline-none" 
                 />
             </div>

             <div className="pt-4 mt-auto">
                 <Button 
                    onClick={handleProposeLogistics} 
                    disabled={!venue || !dateTime}
                    className="w-full py-4 text-lg"
                 >
                     PROPOSE TIME
                 </Button>
             </div>
        </div>
      )}

      {step === 'review' && (
          <div className="space-y-6 flex-1 bg-slate-900/50 p-6 rounded-3xl border border-slate-700 backdrop-blur-sm animate-fade-in shadow-xl">
             <div className="flex items-center gap-2 mb-2 text-billiard-yellow font-bold text-xs uppercase tracking-wider">
                 <Sword className="w-4 h-4" /> Final Confirmation
             </div>

             <div className="bg-slate-800/50 border border-slate-600 p-4 rounded-xl text-slate-300 text-sm mb-4">
                 <p className="font-bold text-white mb-1">{opponent.display_name} has responded!</p>
                 <p>They have accepted your challenge terms and proposed the following time:</p>
             </div>

             <div className="bg-black/40 p-4 rounded-xl border border-slate-700 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-display text-xs uppercase">Discipline</span>
                    <span className="font-bold text-white">{discipline}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-display text-xs uppercase">Race To</span>
                    <span className="font-bold text-white">{raceTo}</span>
                 </div>
                 <div className="h-px bg-slate-700 my-2"></div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-display text-xs uppercase">Venue</span>
                    <span className="font-bold text-billiard-yellow text-lg">{venue}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-display text-xs uppercase">Time</span>
                    <span className="font-bold text-white text-lg">
                        {dateTime ? new Date(dateTime).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'}) : 'TBD'}
                    </span>
                 </div>
             </div>

             <div className="pt-4 mt-auto space-y-3">
                 <Button onClick={handleFinalConfirm} className="w-full py-4 text-lg">
                     <ThumbsUp className="w-5 h-5 mr-2" /> CONFIRM MATCH
                 </Button>
                 <Button variant="secondary" className="w-full py-3 text-sm" disabled>
                     <XCircle className="w-4 h-4 mr-2" /> Suggest New Time (Coming Soon)
                 </Button>
             </div>
          </div>
      )}
    </div>
  );
};