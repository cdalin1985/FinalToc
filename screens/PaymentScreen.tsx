
import React from 'react';
import { ArrowLeft, Copy, ExternalLink, DollarSign, CreditCard, Landmark } from 'lucide-react';
import { Button } from '../components/Button';

interface PaymentScreenProps {
  onBack: () => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ onBack }) => {
  
  // --- CONFIGURATION: LEAGUE TREASURY ACCOUNTS ---
  // These are the accounts that RECEIVE the money from players.
  // Replace these placeholders with the actual accounts owned by the League Admins.
  const paymentMethods = [
    {
      name: 'Cash App',
      id: 'cashapp',
      color: 'bg-[#00D632]',
      textColor: 'text-white',
      icon: <DollarSign className="w-6 h-6" />,
      handle: '$TopCapitalLeague', // <-- REPLACE with League's Official CashTag
      link: 'https://cash.app/$TopCapitalLeague', 
      description: 'Tap to open Cash App'
    },
    {
      name: 'Venmo',
      id: 'venmo',
      color: 'bg-[#008CFF]',
      textColor: 'text-white',
      icon: <span className="font-bold text-lg italic">V</span>,
      handle: '@TopCapital-League', // <-- REPLACE with League's Official Venmo
      link: 'https://venmo.com/TopCapital-League',
      description: 'Tap to open Venmo'
    },
    {
      name: 'PayPal',
      id: 'paypal',
      color: 'bg-[#003087]',
      textColor: 'text-white',
      icon: <span className="font-bold text-lg italic">P</span>,
      handle: 'paypal.me/TopCapital', // <-- REPLACE with League's PayPal
      link: 'https://paypal.me/TopCapital',
      description: 'Tap to open PayPal'
    },
    {
      name: 'Zelle',
      id: 'zelle',
      color: 'bg-[#6D1ED4]',
      textColor: 'text-white',
      icon: <CreditCard className="w-6 h-6" />,
      handle: 'treasury@topofcapital.com', // <-- REPLACE with League's Zelle Email
      isCopyOnly: true,
      description: 'Copy email to pay in your bank app'
    }
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied League handle (${text}) to clipboard!`);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
            onClick={onBack} 
            className="p-2 bg-slate-800 rounded-full border border-slate-600 hover:bg-slate-700 mr-4 transition-colors"
        >
            <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div>
            <h2 className="text-2xl font-display font-bold text-white uppercase italic tracking-wider">
            League Dues
            </h2>
            <p className="text-billiard-yellow font-bold text-sm">$5.00 / Week</p>
        </div>
      </div>

      <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700 shadow-xl backdrop-blur-sm mb-6 text-center">
        <div className="w-12 h-12 bg-billiard-yellow/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-billiard-yellow/30">
            <Landmark className="w-6 h-6 text-billiard-yellow" />
        </div>
        <h3 className="font-display text-white text-lg mb-1">OFFICIAL TREASURY</h3>
        <p className="text-slate-300 text-sm mb-2 px-4">
            Send your weekly dues to one of the official league accounts below.
        </p>
        <p className="text-xs text-slate-500 italic">
            *Please include your Name and Week # in the payment note.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {paymentMethods.map((method) => (
            <div 
                key={method.id}
                className="bg-slate-800 rounded-2xl p-4 border border-slate-600 shadow-lg flex items-center justify-between group hover:border-white/30 transition-all"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${method.color} ${method.textColor} flex items-center justify-center shadow-inner`}>
                        {method.icon}
                    </div>
                    <div className="text-left">
                        <h3 className="font-display text-lg text-white">{method.name}</h3>
                        <p className="text-xs text-slate-400 font-mono tracking-tight">{method.handle}</p>
                    </div>
                </div>

                {method.isCopyOnly ? (
                    <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleCopy(method.handle)}
                        className="h-10 w-10 p-0 flex items-center justify-center rounded-full"
                    >
                        <Copy className="w-4 h-4" />
                    </Button>
                ) : (
                    <a 
                        href={method.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="h-10 w-10 bg-slate-700 hover:bg-slate-600 text-white rounded-full flex items-center justify-center border border-slate-500 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                )}
            </div>
        ))}
      </div>
      
      <div className="mt-auto pt-6 text-center">
        <p className="text-[10px] text-slate-600 uppercase font-bold flex items-center justify-center gap-2">
            <Shield className="w-3 h-3" /> Secure Payments Processed Externally
        </p>
      </div>
    </div>
  );
};
    
// Helper import for the Shield icon used in footer
import { Shield } from 'lucide-react';
