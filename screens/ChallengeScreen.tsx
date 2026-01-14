
import React, { useState, useEffect } from 'react';
import { User, Venue, Challenge, FeedItem } from '../types';
import { Button } from '../components/Button';
import { 
  ArrowLeft, MapPin, Calendar, CheckCircle2, BellRing, ArrowRight, 
  Shield, Sword, ThumbsUp, XCircle, DollarSign, PlayCircle, 
  CreditCard, Camera, CameraOff, Radio, Check, AlertTriangle, MessageSquare, Gavel, Trophy, Flag
} from 'lucide-react';
import { saveChallenge, addFeedItem, deleteChallenge } from '../services/persistenceService';

interface ChallengeScreenProps {
  currentUser: User;
  opponent: User;
  challenge?: Challenge;
  onBack: () => void;
  onChallengeCreated: () => void;
  initialStep?: 'terms' | 'logistics' | 'review';
}

type ChallengeStep = 'terms' | 'waiting' | 'logistics' | 'review' | 'match_ready' | 'reporting';

export const ChallengeScreen: React.FC<ChallengeScreenProps> = ({ 
  currentUser, 
  opponent, 
  challenge,
  onBack, 
  onChallengeCreated,
  initialStep = 'terms' 
}) => {
  const [step, setStep] = useState<ChallengeStep>(initialStep === 'review' && challenge?.status === 'accepted' ? 'match_ready' : initialStep as ChallengeStep);
  const [raceTo, setRaceTo] = useState(7);
  const [discipline, setDiscipline] = useState('9-ball');
  const [venue, setVenue] = useState<Venue | null>(null);
  const [dateTime, setDateTime] = useState('');
  
  // Reporting State
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Match Start Specific State
  const [isPaid, setIsPaid] = useState(false);
  const [wantsToStream, setWantsToStream] = useState(false);
  const [showDeferralForm, setShowDeferralForm] = useState(false);
  const [deferralReason, setDeferralReason] = useState('');
  const [isDeferred, setIsDeferred] = useState(false);

  useEffect(() => {
    if (challenge) {
        setRaceTo(challenge.race_to);
        setDiscipline(challenge.discipline);
        if (challenge.venue) setVenue(challenge.venue);
        if (challenge.scheduled_time) setDateTime(challenge.scheduled_time);
    }
  }, [challenge]);

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
     await saveChallenge(newChallenge);

     const feed: FeedItem = {
         id: `f_ch_${Date.now()}`,
         user: currentUser,
         content: `Issued a challenge to ${opponent.display_name}! Race to ${raceTo} in ${discipline}.`,
         type: 'challenge_update',
         timestamp: 'Just now',
         likes: 0
     };
     await addFeedItem(feed);
     setStep('waiting');
  };

  const handleProposeLogistics = () => {
    if (!challenge) return;
    const updatedChallenge: Challenge = {
        ...challenge,
        venue: venue!,
        scheduled_time: dateTime,
        status: 'pending_confirmation'
    };
    saveChallenge(updatedChallenge);
    setStep('waiting');
  };

  const handleFinalConfirm = () => {
      if (!challenge) return;
      const finalChallenge: Challenge = {
          ...challenge,
          status: 'accepted'
      };
      saveChallenge(finalChallenge);
      setStep('match_ready');
  };

  const handleReportScore = async () => {
      if (!challenge) return;
      setIsSubmitting(true);
      
      const winner = myScore > oppScore ? currentUser : opponent;
      const feedMsg: FeedItem = {
          id: `res_${Date.now()}`,
          user: winner,
          content: `VICTORY! ${currentUser.display_name} (${myScore}) - ${opponent.display_name} (${oppScore}). Match complete at ${venue}.`,
          type: 'match_result',
          timestamp: 'Just now',
          likes: 0
      };
      
      await addFeedItem(feedMsg);
      await deleteChallenge(challenge.id);
      setIsSubmitting(false);
      onChallengeCreated();
  };

  const handleDeferPayment = async () => {
    if (!deferralReason.trim()) return;
    const adminLog: FeedItem = {
        id: `defer_${Date.now()}`,
        user: currentUser,
        content: `DEFERRED DUES: Match vs ${opponent.display_name}. Promise: "${deferralReason}". Dues total: $6.00.`,
        type: 'system',
        timestamp: 'Just now',
        likes: 0
    };
    await addFeedItem(adminLog);
    setIsDeferred(true);
    setShowDeferralForm(false);
  };

  if (step === 'waiting') {
      return (
          <div className="h-full flex flex-col items-center justify-center animate-fade-in text-center space-y-6">
             <div className="relative">
                 <div className="w-24 h-24 rounded-full border-4 border-slate-700 flex items-center justify-center bg-slate-800">
                     <BellRing className="w-10 h-10 text-billiard-yellow animate-ping" />
                 </div>
                 <div className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
             </div>
             <div>
                <h2 className="font-display text-2xl text-white">CHALLENGE LOGGED</h2>
                <p className="text-slate-400 mt-2">Waiting for {opponent.display_name} to respond.</p>
             </div>
             <Button onClick={onChallengeCreated} className="mt-8">RETURN TO LIST</Button>
          </div>
      )
  }

  if (step === 'reporting') {
      return (
          <div className="h-full flex flex-col animate-fade-in space-y-6 pb-24">
              <div className="text-center">
                  <h2 className="font-display text-3xl text-white italic uppercase">Final Score</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Submit official match data</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 border-2 border-slate-800 p-6 rounded-3xl flex flex-col items-center gap-4">
                      <span className="text-[10px] font-black text-slate-500 uppercase">You</span>
                      <span className="font-display text-5xl text-white">{myScore}</span>
                      <div className="flex gap-2">
                          <button onClick={() => setMyScore(s => Math.max(0, s-1))} className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white">-</button>
                          <button onClick={() => setMyScore(s => s+1)} className="p-3 bg-chalk rounded-xl border border-white/20 text-slate-950 font-bold">+</button>
                      </div>
                  </div>
                  <div className="bg-slate-900 border-2 border-slate-800 p-6 rounded-3xl flex flex-col items-center gap-4">
                      <span className="text-[10px] font-black text-slate-500 uppercase">{opponent.display_name}</span>
                      <span className="font-display text-5xl text-white">{oppScore}</span>
                      <div className="flex gap-2">
                          <button onClick={() => setOppScore(s => Math.max(0, s-1))} className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white">-</button>
                          <button onClick={() => setOppScore(s => s+1)} className="p-3 bg-billiard-red rounded-xl border border-white/20 text-white font-bold">+</button>
                      </div>
                  </div>
              </div>

              <div className="bg-felt/10 border border-felt-light/20 p-4 rounded-2xl flex items-start gap-3">
                  <Flag className="w-5 h-5 text-felt-light shrink-0" />
                  <p className="text-[10px] text-slate-400 leading-relaxed italic">
                      Submission of fraudulent scores is grounds for immediate expulsion from Top of the Capital. By submitting, you affirm both players agree on this outcome.
                  </p>
              </div>

              <Button onClick={handleReportScore} isLoading={isSubmitting} className="w-full py-5 text-lg" variant="primary">
                  <CheckCircle2 className="w-6 h-6 mr-2" /> SUBMIT RESULTS
              </Button>
              <button onClick={() => setStep('match_ready')} className="w-full py-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">Cancel</button>
          </div>
      )
  }

  if (step === 'match_ready') {
      return (
        <div className="h-full flex flex-col animate-fade-in space-y-6 pb-24">
            <div className="text-center py-4">
                <div className="inline-block bg-green-500/10 text-green-400 text-[10px] font-black px-4 py-1 rounded-full border border-green-500/20 mb-2 uppercase tracking-widest">
                    Operational Status: Active
                </div>
                <h2 className="font-display text-4xl text-white italic tracking-tighter uppercase leading-none">Match Portal</h2>
            </div>

            <div className={`p-6 rounded-3xl border-2 transition-all ${isPaid ? 'bg-green-950/20 border-green-500/40' : isDeferred ? 'bg-orange-950/20 border-orange-500/40' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-display text-white uppercase text-lg leading-none">League Dues</h3>
                        <p className={`text-[10px] font-bold uppercase mt-1 tracking-widest italic ${isDeferred ? 'text-orange-400' : 'text-slate-500'}`}>
                            {isDeferred ? 'Arrears Balance: $6.00' : 'Treasury Contribution: $5.00'}
                        </p>
                    </div>
                    {isPaid ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : isDeferred ? <AlertTriangle className="w-6 h-6 text-orange-400" /> : <CreditCard className="w-6 h-6 text-slate-600" />}
                </div>

                {!isPaid && !isDeferred && !showDeferralForm && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            <a href="https://venmo.com/TopCapital-League" target="_blank" className="bg-[#008CFF] py-3 rounded-xl flex items-center justify-center border-b-4 border-black/30 active:border-b-0 active:translate-y-1">
                                <span className="font-bold text-lg italic text-white">V</span>
                            </a>
                            <a href="https://cash.app/$TopCapitalLeague" target="_blank" className="bg-[#00D632] py-3 rounded-xl flex items-center justify-center border-b-4 border-black/30 active:border-b-0 active:translate-y-1 text-white">
                                <DollarSign className="w-6 h-6" />
                            </a>
                            <button onClick={() => setIsPaid(true)} className="bg-slate-700 py-3 rounded-xl flex flex-col items-center justify-center border-b-4 border-black/30 text-white active:border-b-0 active:translate-y-1">
                                <Check className="w-5 h-5" />
                                <span className="text-[8px] font-black uppercase">Verify</span>
                            </button>
                        </div>
                        <button onClick={() => setShowDeferralForm(true)} className="w-full text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest hover:text-white transition-colors py-2">Defer Payment? ($1.00 Fee Applies)</button>
                    </div>
                )}

                {showDeferralForm && (
                    <div className="space-y-4 animate-slide-up">
                        <textarea value={deferralReason} onChange={(e) => setDeferralReason(e.target.value)} placeholder="State promise date and reason..." className="w-full bg-black/40 border border-slate-700 rounded-xl p-3 text-white text-[10px] h-20 outline-none" />
                        <div className="flex gap-2">
                            <button onClick={() => setShowDeferralForm(false)} className="flex-1 py-3 text-[10px] font-bold text-slate-500 uppercase">Cancel</button>
                            <Button onClick={handleDeferPayment} disabled={!deferralReason.trim()} className="flex-1 py-3 text-[10px]" variant="secondary">COMMIT TO RECORD</Button>
                        </div>
                    </div>
                )}

                {(isPaid || isDeferred) && (
                    <div className="flex items-center gap-2 text-green-400 font-bold text-xs uppercase tracking-widest bg-green-400/10 p-2 rounded-xl justify-center">
                        <Shield className="w-4 h-4" /> Dues Settled // Treasury Updated
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => setStep('reporting')} className="py-6 flex flex-col gap-2" variant="outline">
                    <Trophy className="w-6 h-6 text-billiard-yellow" />
                    <span className="text-[10px]">Report Final Score</span>
                </Button>
                <button 
                  onClick={() => onChallengeCreated()}
                  className="bg-slate-800 rounded-2xl border-2 border-slate-700 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Back to List</span>
                </button>
            </div>
            
            <div className="pt-4">
                <Button onClick={() => alert("Telepresence relay starting...")} className="w-full py-6 text-xl group shadow-[0_0_40px_rgba(34,197,94,0.3)]" variant="primary">
                    <PlayCircle className="w-6 h-6" /> COMMENCE RACK
                </Button>
            </div>
        </div>
      );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        {step === 'terms' ? (
             <button onClick={onBack} className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 border border-slate-600 transition-colors">
                <ArrowLeft className="w-5 h-5 text-white" />
            </button>
        ) : <div className="w-9"></div>}
       
        <span className="font-display text-lg text-slate-300 uppercase italic">
            {step === 'terms' ? 'Challenge Terms' : step === 'logistics' ? 'Set Time' : 'Review Match'}
        </span>
        <div className="w-9"></div> 
      </div>

      <div className={`relative ${step === 'terms' ? 'h-40' : 'h-24'} mb-6 transition-all duration-500`}>
         <div className="absolute left-0 top-0 bottom-0 w-[55%] bg-slate-800 skew-x-12 -ml-4 overflow-hidden border-r-4 border-billiard-yellow z-10 shadow-2xl">
            <img src={currentUser.avatar_url} className="w-full h-full object-cover opacity-60 skew-x-[-12deg] scale-125" />
            <div className="absolute bottom-2 left-8 -skew-x-12 font-display text-[9px] text-white bg-black/70 px-2 py-0.5 rounded italic">CHALLENGER</div>
         </div>
         <div className="absolute right-0 top-0 bottom-0 w-[55%] bg-billiard-red skew-x-12 -mr-4 overflow-hidden border-l-4 border-white shadow-2xl">
            <img src={opponent.avatar_url} className="w-full h-full object-cover opacity-60 skew-x-[-12deg] scale-125" />
            <div className="absolute bottom-2 right-8 -skew-x-12 font-display text-[9px] text-white bg-black/70 px-2 py-0.5 rounded italic">DEFENDER</div>
         </div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white rounded-full flex items-center justify-center border-4 border-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            <span className="font-display font-black text-xl text-slate-900 italic">VS</span>
         </div>
      </div>

      {step === 'terms' && (
          <div className="space-y-6 flex-1 bg-slate-900/50 p-6 rounded-3xl border border-slate-700 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-2 mb-2 text-billiard-yellow font-bold text-xs uppercase tracking-wider">
                <Sword className="w-4 h-4" /> Challenge Settings
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
                <input 
                    type="range" 
                    min="5" 
                    max="15" 
                    value={raceTo} 
                    onChange={(e) => setRaceTo(parseInt(e.target.value))}
                    className="w-full accent-billiard-yellow h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            <div className="pt-4 mt-auto">
                <Button onClick={handleSendChallenge} className="w-full py-4 text-xl shadow-[0_0_30px_rgba(229,57,53,0.3)] group" variant="danger">
                    ISSUE CHALLENGE <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </div>
      )}

      {step === 'logistics' && (
        <div className="space-y-6 flex-1 bg-slate-900/50 p-6 rounded-3xl border border-slate-700 backdrop-blur-sm shadow-xl">
             <div className="flex items-center gap-2 mb-2 text-green-400 font-bold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4" /> Propose Logistics
             </div>

             <div>
                <label className="block font-display text-sm text-chalk mb-3 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Match Venue
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

             <div>
                 <label className="block font-display text-sm text-chalk mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Proposed Time
                 </label>
                 <input 
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full bg-slate-800 border-2 border-slate-600 rounded-xl p-4 text-white text-lg font-bold focus:border-chalk outline-none" 
                 />
             </div>

             <div className="pt-4 mt-auto">
                 <Button onClick={handleProposeLogistics} disabled={!venue || !dateTime} className="w-full py-4 text-lg">
                     PROPOSE TIME
                 </Button>
             </div>
        </div>
      )}

      {step === 'review' && (
          <div className="space-y-6 flex-1 bg-slate-900/50 p-6 rounded-3xl border border-slate-700 backdrop-blur-sm shadow-xl">
             <div className="flex items-center gap-2 mb-2 text-billiard-yellow font-bold text-xs uppercase tracking-wider">
                 <Sword className="w-4 h-4" /> Finalize Match
             </div>

             <div className="bg-black/40 p-5 rounded-3xl border-2 border-slate-700 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-display text-[10px] uppercase tracking-widest">Discipline</span>
                    <span className="font-bold text-white uppercase italic">{discipline}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-display text-[10px] uppercase tracking-widest">Race To</span>
                    <span className="font-bold text-white text-lg"> {raceTo}</span>
                 </div>
                 <div className="h-px bg-slate-800 my-2"></div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-display text-[10px] uppercase tracking-widest">Location</span>
                    <span className="font-bold text-billiard-yellow text-base">{venue}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-display text-[10px] uppercase tracking-widest">Match Time</span>
                    <span className="font-bold text-white text-base">
                        {dateTime ? new Date(dateTime).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'}) : 'TBD'}
                    </span>
                 </div>
             </div>

             <div className="pt-4 mt-auto">
                 <Button onClick={handleFinalConfirm} className="w-full py-4 text-lg shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                     <ThumbsUp className="w-5 h-5 mr-2" /> CONFIRM & SCHEDULE
                 </Button>
             </div>
          </div>
      )}
    </div>
  );
};
