import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  // Game Style: Rounded, Glossy, 3D Push effect
  const baseStyles = "relative font-display uppercase tracking-wider font-bold rounded-xl transition-all duration-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-[2px] active:shadow-none";
  
  const sizes = {
    sm: "py-2 px-3 text-xs",
    md: "py-3 px-6 text-sm",
    lg: "py-4 px-8 text-lg"
  };

  const variants = {
    primary: "bg-gradient-to-b from-felt-light to-felt text-white border-2 border-green-400 shadow-[0_4px_0_#022c18]",
    secondary: "bg-gradient-to-b from-slate-600 to-slate-800 text-white border-2 border-slate-500 shadow-[0_4px_0_#0f172a]",
    outline: "bg-transparent border-2 border-white/50 text-white hover:bg-white/10",
    danger: "bg-gradient-to-b from-red-500 to-red-700 text-white border-2 border-red-400 shadow-[0_4px_0_#7f1d1d]",
    ghost: "bg-transparent text-slate-400 hover:text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
};