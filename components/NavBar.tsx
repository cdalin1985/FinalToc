import React from 'react';
import { Home, ListOrdered, Tv, User, BrainCircuit } from 'lucide-react';
import { ScreenName } from '../types';

interface NavBarProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ currentScreen, onNavigate }) => {
  const navItems: { id: ScreenName; icon: React.ReactNode; label: string; color: string }[] = [
    { id: 'dashboard', icon: <Home className="w-6 h-6" />, label: 'Home', color: 'bg-billiard-yellow' },
    { id: 'ladder', icon: <ListOrdered className="w-6 h-6" />, label: 'The List', color: 'bg-billiard-red' },
    { id: 'stream', icon: <Tv className="w-6 h-6" />, label: 'Live', color: 'bg-chalk' },
    { id: 'coach', icon: <BrainCircuit className="w-6 h-6" />, label: 'Pro', color: 'bg-purple-600' },
    { id: 'profile', icon: <User className="w-6 h-6" />, label: 'Me', color: 'bg-slate-700' },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:top-4 md:right-4 md:bottom-auto md:w-auto">
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-2 flex justify-between items-center md:flex-col md:gap-4">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-14 h-14 ${
                isActive ? '-translate-y-4 scale-110' : 'hover:bg-white/10'
              }`}
            >
              <div 
                className={`absolute inset-0 rounded-full blur-md opacity-0 transition-opacity ${isActive ? 'opacity-50' : ''} ${item.color}`} 
              />
              <div 
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 ${
                  isActive 
                    ? `${item.color} border-white text-white shadow-[0_4px_8px_rgba(0,0,0,0.5)]` 
                    : 'bg-slate-800 border-slate-600 text-slate-400'
                }`}
              >
                {item.icon}
              </div>
              {isActive && (
                <span className="absolute -bottom-6 text-[10px] font-bold font-display text-white bg-slate-900 px-2 py-0.5 rounded-full shadow-lg border border-slate-700 whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};