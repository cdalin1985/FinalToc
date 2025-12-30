import React, { useState } from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

const DAILY_QUESTS = [
    { id: 1, title: 'Rack Runner', description: 'Win 3 racks in a row', reward: 50 },
    { id: 2, title: 'Sharpshooter', description: 'Pot a ball from over 5 feet', reward: 30 },
    { id: 3, title: 'Safety First', description: 'Play 5 safety shots', reward: 40 },
    { id: 4, title: 'The Challenger', description: 'Send a challenge to a player ranked higher than you', reward: 60 },
];

export const DailyQuest: React.FC = () => {
    // Select a random quest for the "day" (stable for this session)
    const [quest] = useState(() => DAILY_QUESTS[Math.floor(Math.random() * DAILY_QUESTS.length)]);
    const [completed, setCompleted] = useState(false);

    const handleClaim = () => {
        setCompleted(true);
        // In a real app, this would call an API to award XP
    };

    if (completed) {
        return (
            <div className="bg-gradient-to-r from-green-900 to-green-800 rounded-2xl p-4 border border-green-600 shadow-lg animate-fade-in flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-white text-sm">QUEST COMPLETED!</h3>
                        <p className="text-green-200 text-xs">You earned {quest.reward} XP</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-1 border-2 border-slate-700 shadow-lg relative overflow-hidden group">
            {/* Background effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-billiard-yellow/10 rounded-full -mr-10 -mt-10 blur-xl group-hover:bg-billiard-yellow/20 transition-all"></div>

            <div className="bg-slate-900/50 rounded-xl p-4 relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-xl border-2 border-slate-600 flex items-center justify-center shadow-inner">
                    <Target className="w-6 h-6 text-billiard-yellow" />
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider text-outline">Daily Quest</h3>
                        <span className="bg-billiard-yellow text-black text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/50">+{quest.reward} XP</span>
                    </div>
                    <p className="font-bold text-slate-200 text-sm">{quest.title}</p>
                    <p className="text-slate-400 text-xs">{quest.description}</p>
                </div>

                <Button size="sm" onClick={handleClaim} variant="secondary" className="h-auto py-2 px-3 text-xs border-slate-500 hover:bg-green-600 hover:text-white hover:border-green-400">
                    CLAIM
                </Button>
            </div>
        </div>
    );
};
