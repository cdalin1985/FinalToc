
import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { User } from '../types';
import { delay } from '../services/mockData';
import { getUsers, updateUser } from '../services/persistenceService';
import { uploadImageToCloudinary, uploadBase64ToCloudinary } from '../services/cloudinaryService';
import { PlayCircle, Search, Upload, Wand2, ArrowRight, User as UserIcon, Loader2, CheckSquare, Square, Sparkles, UserCircle2 } from 'lucide-react';
import { generateAvatar, generateCreativeAvatarPrompt } from '../services/geminiService';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'select' | 'details' | 'avatar'>('select');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPrompt, setAvatarPrompt] = useState('');

  useEffect(() => {
    const fetch = async () => {
        const data = await getUsers();
        setAllUsers(data);
    }
    fetch();
  }, []);

  const filteredUsers = allUsers.filter(u => 
    u.display_name.toLowerCase().includes(searchTerm.toLowerCase()) && !u.is_claimed
  );

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setAvatarUrl(user.avatar_url || null);
    setStep('details');
  };

  const handleGuestLogin = () => {
      const guestUser: User = {
          id: `guest_${Date.now()}`,
          display_name: 'Guest Player',
          fargo_rate: 400,
          rank: 999,
          is_claimed: true,
          avatar_url: 'https://i.pravatar.cc/150?u=guest'
      };
      onLogin(guestUser);
  };

  const handleGenerateAvatar = async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    // 1. Generate Base64 from Gemini
    const generatedBase64 = await generateAvatar(selectedUser.display_name, avatarPrompt);
    if (generatedBase64) {
        setAvatarUrl(generatedBase64); // Show preview immediately
        
        // 2. Upload to Cloudinary to get permanent URL
        // (We do this silently or during finalize, but let's try now to save it)
        try {
            const cloudUrl = await uploadBase64ToCloudinary(generatedBase64);
            if (cloudUrl) setAvatarUrl(cloudUrl);
        } catch(e) { console.error("Cloudinary failed", e); }
    }
    setIsLoading(false);
  };

  const handleAutoPrompt = async () => {
    setIsGeneratingPrompt(true);
    const creativePrompt = await generateCreativeAvatarPrompt();
    setAvatarPrompt(creativePrompt);
    setIsGeneratingPrompt(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const url = await uploadImageToCloudinary(file);
      if (url) {
          setAvatarUrl(url);
      } else {
          // Fallback to local reader if cloud fails
          const reader = new FileReader();
          reader.onloadend = () => setAvatarUrl(reader.result as string);
          reader.readAsDataURL(file);
      }
      setIsLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    
    const finalUser: User = {
      ...selectedUser,
      email: formData.email,
      phone: formData.phone,
      avatar_url: avatarUrl || 'https://i.pravatar.cc/150?u=pool_player',
      is_claimed: true
    };
    
    // Save to persistence (Supabase)
    await updateUser(finalUser);
    
    setIsLoading(false);
    onLogin(finalUser);
  };

  const renderStep = () => {
    switch (step) {
      case 'select':
        return (
          <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-2xl animate-fade-in">
             <h3 className="font-display text-xl text-white mb-4 text-center">CLAIM YOUR PROFILE</h3>
             <div className="relative mb-4">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Search your name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-billiard-yellow transition-colors"
                />
             </div>
             <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar mb-4">
                {filteredUsers.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No unclaimed players found.</p>
                ) : (
                  filteredUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-transparent hover:border-slate-500 flex justify-between items-center group transition-all"
                    >
                      <span className="font-display text-sm text-white">{user.display_name}</span>
                      <span className="text-xs font-bold text-slate-400 group-hover:text-billiard-yellow">RANK #{user.rank}</span>
                    </button>
                  ))
                )}
             </div>

             {/* GUEST ACCESS */}
             <div className="border-t border-slate-700 pt-4 mt-2">
                 <button 
                    onClick={handleGuestLogin}
                    className="w-full py-3 rounded-xl border border-dashed border-slate-500 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider"
                 >
                     <UserCircle2 className="w-5 h-5" />
                     Guest Access
                 </button>
             </div>
          </div>
        );

      case 'details':
        return (
          <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-2xl animate-fade-in">
             <div className="text-center mb-6">
                <h3 className="font-display text-xl text-white">PLAYER DETAILS</h3>
                <p className="text-billiard-yellow font-bold text-sm">{selectedUser?.display_name}</p>
             </div>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Email</label>
                 <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-chalk outline-none"
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Phone</label>
                 <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-chalk outline-none"
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Password</label>
                 <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-chalk outline-none"
                 />
               </div>

               <div className="flex gap-3 mt-6">
                 <Button variant="secondary" onClick={() => setStep('select')}>Back</Button>
                 <Button className="flex-1" onClick={() => setStep('avatar')}>Next <ArrowRight className="w-4 h-4 ml-1" /></Button>
               </div>
             </div>
          </div>
        );

      case 'avatar':
        return (
           <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-2xl animate-fade-in text-center">
              <h3 className="font-display text-xl text-white mb-6">PLAYER PHOTO</h3>
              
              <div className="mb-4 text-left">
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Avatar Style Prompt (Optional)</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={avatarPrompt}
                        onChange={(e) => setAvatarPrompt(e.target.value)}
                        placeholder="e.g. A robotic shark with a cue"
                        className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-chalk outline-none text-sm"
                    />
                    <button 
                        onClick={handleAutoPrompt}
                        disabled={isGeneratingPrompt}
                        className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg border border-slate-500 transition-colors"
                        title="Generate Random Style"
                    >
                        {isGeneratingPrompt ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-billiard-yellow" />}
                    </button>
                </div>
              </div>

              {/* Updated Layout per Screenshot */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6 w-full">
                  {/* Left: Upload */}
                  <label className="flex-1 w-full md:w-auto aspect-square max-w-[120px] border-2 border-dashed border-slate-600 hover:border-chalk rounded-xl flex flex-col items-center justify-center cursor-pointer p-2 text-center transition-all bg-slate-800/50 hover:bg-slate-800">
                      <Upload className="w-6 h-6 text-chalk mb-2" />
                      <span className="text-[10px] font-bold text-slate-400 leading-tight">Upload your own photo</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </label>

                  {/* Center: Avatar */}
                  <div className="w-32 h-32 rounded-full border-4 border-billiard-yellow bg-slate-800 overflow-hidden relative shadow-[0_0_20px_rgba(255,179,0,0.3)] flex-shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UserIcon className="w-16 h-16 text-slate-600" />
                        </div>
                      )}
                      {isLoading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                           <Loader2 className="animate-spin w-8 h-8 text-white" />
                        </div>
                      )}
                  </div>

                  {/* Right: Generate */}
                  <button 
                      onClick={handleGenerateAvatar}
                      disabled={isLoading}
                      className="flex-1 w-full md:w-auto aspect-square max-w-[120px] border-2 border-dashed border-slate-600 hover:border-purple-500 rounded-xl flex flex-col items-center justify-center cursor-pointer p-2 text-center transition-all bg-slate-800/50 hover:bg-slate-800"
                  >
                       <Wand2 className="w-6 h-6 text-purple-500 mb-2" />
                       <span className="text-[10px] font-bold text-slate-400 leading-tight">Or keep generating till you have one you like.</span>
                  </button>
              </div>

              {/* Remember Me Checkbox */}
              <div 
                className="flex items-center justify-center gap-2 mb-4 cursor-pointer text-slate-300 hover:text-white"
                onClick={() => setRememberMe(!rememberMe)}
              >
                  {rememberMe ? <CheckSquare className="w-5 h-5 text-billiard-yellow" /> : <Square className="w-5 h-5" />}
                  <span className="text-sm font-bold">Remember me on this device</span>
              </div>

              <Button onClick={handleFinalize} className="w-full py-4 text-lg">
                 ENTER LEAGUE
              </Button>
           </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] relative p-4">
      {/* Background Graphic Element */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className="w-96 h-96 rounded-full border-[20px] border-white"></div>
        <div className="absolute w-80 h-80 rounded-full border-[2px] border-white"></div>
      </div>

      <div className="z-10 w-full flex flex-col items-center">
        {step === 'select' && (
           <div className="mb-8 text-center animate-bounce">
              <h1 className="font-display text-5xl text-white text-outline drop-shadow-xl transform -rotate-3 leading-tight">
                TOP OF
              </h1>
              <h2 className="font-display text-4xl text-billiard-yellow text-outline drop-shadow-xl transform rotate-2">
                THE CAPITAL
              </h2>
              <p className="font-sans text-sm text-chalk font-bold mt-2 tracking-wide drop-shadow-md">
                Helena's most flexible and versatile pool league.
              </p>
           </div>
        )}
        
        {renderStep()}
      </div>
    </div>
  );
};
