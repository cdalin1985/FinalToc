
import React from 'react';
import { ListOrdered, MessageSquare, User } from 'lucide-react';
import { ScreenName } from '../types';

interface NavBarProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ currentScreen, onNavigate }) => {
  const navItems: { id: ScreenName; icon: React.ReactNode; label: string; color: string }[] = [
    { id: 'ladder', icon: <ListOrdered className="w-6 h-6" />, label: 'Ladder', color: 'bg-billiard-red' },
    { id: 'feed', icon: <MessageSquare className="w-6 h-6" />, label: 'Feed', color: 'bg-chalk' },
    { id: 'profile', icon: <User className="w-6 h-6" />, label: 'Me', color: 'bg-slate-700' },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:bottom-6 md:right-1/2 md:translate-x-1/2">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.6)] p-2 flex justify-between items-center gap-8 px-8">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-16 h-14 ${
                isActive ? '-translate-y-2' : 'hover:bg-white/5 opacity-60'
              }`}
            >
              <div 
                className={`relative z-10 w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                  isActive 
                    ? `${item.color} text-white shadow-[0_8px_15px_rgba(0,0,0,0.4)] border-b-4 border-black/20` 
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {item.icon}
              </div>
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
