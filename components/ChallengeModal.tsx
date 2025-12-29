import React, { useState } from 'react';
import { Button } from './Button';
import { callCreateChallenge } from '../services/edgeFunctions';

interface Props {
  currentUser: any;
  opponent: any;
  onClose: () => void;
  onCreated: () => void;
}

export const ChallengeModal: React.FC<Props> = ({ currentUser, opponent, onClose, onCreated }) => {
  const [discipline, setDiscipline] = useState<'8-ball'|'9-ball'|'10-ball'>('9-ball');
  const [raceTo, setRaceTo] = useState<number>(7);
  const [loading, setLoading] = useState(false);

  const sendChallenge = async () => {
    setLoading(true);
    const payload = {
      challenger_id: currentUser.id,
      opponent_id: opponent.id,
      discipline,
      race_to: raceTo
    };
    const res = await callCreateChallenge(payload);
    setLoading(false);
    if (res?.data) {
      onCreated();
      onClose();
    } else {
      alert('Failed to send challenge');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 p-6 rounded-2xl w-96">
        <h3 className="text-lg font-display font-bold mb-4">Challenge {opponent.display_name}</h3>

        <label className="block text-sm text-slate-400 mb-1">Discipline</label>
        <div className="flex gap-2 mb-4">
          {['8-ball','9-ball','10-ball'].map((d:any) => (
            <button key={d} onClick={() => setDiscipline(d)} className={`py-2 px-3 rounded ${discipline===d? 'bg-billiard-yellow text-black':'bg-slate-800 text-white'}`}>
              {d}
            </button>
          ))}
        </div>

        <label className="block text-sm text-slate-400 mb-1">Race To (min 5)</label>
        <select value={raceTo} onChange={(e) => setRaceTo(parseInt(e.target.value))} className="w-full bg-slate-800 p-3 rounded mb-4">
          {Array.from({length:11}, (_,i) => i+5).map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" isLoading={loading} onClick={sendChallenge}>Send Challenge</Button>
        </div>
      </div>
    </div>
  );
};

