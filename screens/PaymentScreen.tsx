
import React from 'react';
import { ArrowLeft, Copy, ExternalLink, DollarSign, CreditCard, Landmark, Shield } from 'lucide-react';
import { Button } from '../components/Button';

interface PaymentScreenProps {
  onBack: () => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ onBack }) => {
  const paymentMethods = [
    {
      name: 'Cash App',
      id: 'cashapp',
      color: 'bg-[#00D632]',
      textColor: 'text-white',
      icon: <DollarSign className="w-6 h-6" />,
      handle: '$TopCapitalLeague',
      link: 'https://cash.app/$TopCapitalLeague', 
      description: 'Tap to open Cash App'
    },
    {
      name: 'Venmo',
      id: 'venmo',
      color: 'bg-[#008CFF]',
      textColor: 'text-white',
      icon: <span className="font-bold text-lg italic">V</span>,
      handle: '@TopCapital-League',
      link: 'https://venmo.com/TopCapital-League',
      description: 'Tap to open Venmo'
    }
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied League handle (${text}) to clipboard!`);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in pb-20">
      
      <div className="flex items-center mb-6">
        <button 
            onClick={onBack} 
            className="p-2 bg-slate-900 rounded-xl border border-slate-700 hover:bg-slate-800 mr-4 transition-colors"
        >
            <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
            <h2 className="text-2xl font-display font-bold text-white uppercase italic tracking-tighter">
              Dues & Treasury
            </h2>
            <p className="text-billiard-yellow font-display text-[10px] tracking-widest uppercase">$5.00 Per Match</p>
        </div>
      </div>

      <div className="bg-slate-900/80 p-6 rounded-3xl border-2 border-slate-800 shadow-2xl backdrop-blur-md mb-6 text-center">
        <div className="w-14 h-14 bg-billiard-yellow/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-billiard-yellow/20">
            <Landmark className="w-7 h-7 text-billiard-yellow" />
        </div>
        <h3 className="font-display text-white text-lg mb-1 tracking-wider">OFFICIAL REPOSITORY</h3>
        <p className="text-slate-400 text-xs mb-3 px-6 leading-relaxed">
            Players pay <span className="text-white font-bold">$5.00</span> for every match engagement. Please settle before play.
        </p>
        <p className="text-[10px] text-slate-500 italic font-bold">
            *Include your name and match details in the note.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {paymentMethods.map((method) => (
            <div 
                key={method.id}
                className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 shadow-xl flex items-center justify-between group hover:border-chalk/30 transition-all"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${method.color} ${method.textColor} flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]`}>
                        {method.icon}
                    </div>
                    <div className="text-left">
                        <h3 className="font-display text-sm text-white uppercase">{method.name}</h3>
                        <p className="text-[10px] text-chalk font-mono font-bold">{method.handle}</p>
                    </div>
                </div>

                <a 
                    href={method.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-11 w-11 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center border-b-4 border-black/40 transition-all active:border-b-0 active:translate-y-1"
                >
                    <ExternalLink className="w-5 h-5" />
                </a>
            </div>
        ))}
      </div>
      
      <div className="mt-auto pt-10 text-center">
        <p className="text-[9px] text-slate-600 uppercase font-black flex items-center justify-center gap-2 tracking-widest">
            <Shield className="w-3 h-3" /> Secure League Payments Only
        </p>
      </div>
    </div>
  );
};
