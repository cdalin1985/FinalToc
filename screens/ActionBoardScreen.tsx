
import React, { useState, useEffect } from 'react';
import { User, FeedItem } from '../types';
import { getFeed, addFeedItem } from '../services/persistenceService';
import { Button } from '../components/Button';
import { Send, MessageSquare, Trophy, Shield, Info, Heart, Loader2, Clock, Sword } from 'lucide-react';

interface ActionBoardScreenProps {
  currentUser: User;
}

export const ActionBoardScreen: React.FC<ActionBoardScreenProps> = ({ currentUser }) => {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  const loadFeed = async () => {
      const data = await getFeed();
      setFeed(data);
      setLoading(false);
      // Mark as read
      localStorage.setItem('last_feed_view_time', Date.now().toString());
  }

  useEffect(() => {
    loadFeed();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const post: FeedItem = {
      id: Date.now().toString(),
      user: currentUser,
      content: newPost,
      type: 'comment',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      likes: 0
    };

    await addFeedItem(post);
    setNewPost('');
    setLoading(true);
    await loadFeed();
  };

  const getIconForType = (type: FeedItem['type']) => {
    switch (type) {
      case 'match_result': return <Trophy className="w-5 h-5 text-billiard-yellow" />;
      case 'challenge_update': return <Sword className="w-5 h-5 text-billiard-red" />;
      case 'system': return <Info className="w-5 h-5 text-chalk" />;
      default: return <MessageSquare className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in pb-20">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-display font-bold text-white text-outline italic uppercase tracking-tighter">
          LEAGUE FEED
        </h2>
        <p className="text-billiard-yellow font-bold text-[9px] tracking-[0.1em] uppercase max-w-xs mx-auto">
          OFFICIAL LEAGUE CHRONICLE & SOCIAL STREAM
        </p>
      </div>

      <div className="bg-slate-900/80 p-4 rounded-3xl border border-slate-800 mb-6 shadow-xl backdrop-blur-md">
        <form onSubmit={handlePost} className="flex gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-700 overflow-hidden flex-shrink-0 border-2 border-slate-600">
             <img src={currentUser.avatar_url} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
             <textarea 
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share match logs or smack talk..."
                className="w-full bg-slate-800 border-none rounded-xl p-3 text-white placeholder:text-slate-600 text-sm focus:ring-1 focus:ring-chalk resize-none h-20 transition-all"
             />
             <div className="flex justify-end mt-2">
                <Button size="sm" type="submit" disabled={!newPost.trim()} className="py-2 px-6 h-auto text-[10px] tracking-widest font-black">
                    POST <Send className="w-3 h-3 ml-1" />
                </Button>
             </div>
          </div>
        </form>
      </div>

      <div className="space-y-4 flex-1">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="animate-spin text-chalk"/>
                <span className="text-[10px] text-slate-500 font-display uppercase tracking-widest">Scanning Log...</span>
            </div>
        ) : (
            feed.map((item) => {
                const isChallenge = item.type === 'challenge_update';
                return (
                    <div key={item.id} className={`p-5 rounded-3xl border-2 flex flex-col gap-4 transition-all shadow-lg ${
                        isChallenge ? 'bg-red-950/20 border-red-900/50' : 
                        item.type === 'system' ? 'bg-slate-900/40 border-slate-800 italic' : 
                        'bg-slate-800/60 border-slate-700/50'
                    }`}>
                        <div className="flex justify-between items-start w-full">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-slate-600 overflow-hidden shadow-xl flex-shrink-0">
                                    <img src={item.user.avatar_url || 'https://i.pravatar.cc/150?u=bot'} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className={`font-display text-lg uppercase tracking-tight leading-none ${isChallenge ? 'text-billiard-red' : 'text-white'}`}>
                                        {item.user.display_name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock className="w-3 h-3 text-slate-500" />
                                        <span className="text-[9px] font-black text-slate-500 uppercase">{item.timestamp}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-inner">
                                    {getIconForType(item.type)}
                                </div>
                                {isChallenge && (
                                    <span className="bg-billiard-red text-white text-[8px] font-black px-2 py-1 rounded-lg animate-pulse tracking-tighter">
                                        CHALLENGE ISSUED
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <p className={`text-base leading-relaxed px-1 ${
                            item.type === 'system' ? 'text-chalk font-medium' : 
                            isChallenge ? 'text-red-100 font-bold' :
                            'text-slate-200'
                        }`}>
                            {item.content}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                            <button className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 hover:text-red-400 transition-colors uppercase tracking-tighter">
                                <Heart className={`w-3 h-3 ${item.likes > 0 ? 'fill-red-500 text-red-500' : ''}`} /> {item.likes} LIKES
                            </button>
                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">LOG ID: #{item.id.slice(-4)}</span>
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};
