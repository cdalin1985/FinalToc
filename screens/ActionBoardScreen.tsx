
import React, { useState, useEffect } from 'react';
import { User, FeedItem } from '../types';
import { getFeed, addFeedItem } from '../services/persistenceService';
import { generateSmackTalk } from '../services/geminiService';
import { Button } from '../components/Button';
import { Send, MessageSquare, Trophy, Shield, Info, Heart, Loader2, Sparkles } from 'lucide-react';

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
  }

  useEffect(() => {
    loadFeed();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const post: FeedItem = {
      id: Date.now().toString(), // Will be ignored by DB auto-gen
      user: currentUser,
      content: newPost,
      type: 'comment',
      timestamp: 'Just now',
      likes: 0
    };

    await addFeedItem(post);
    setNewPost('');
    setLoading(true);
    await loadFeed(); // Reload
  };

  const handleGenerateSmack = async () => {
      const smack = await generateSmackTalk('funny');
      setNewPost(smack);
  };

  const getIconForType = (type: FeedItem['type']) => {
    switch (type) {
      case 'match_result': return <Trophy className="w-4 h-4 text-billiard-yellow" />;
      case 'challenge_update': return <Shield className="w-4 h-4 text-blue-400" />;
      case 'system': return <Info className="w-4 h-4 text-chalk" />;
      default: return <MessageSquare className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in pb-20">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-display font-bold text-white text-outline drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
          ACTION BOARD
        </h2>
        <div className="w-24 h-1 bg-billiard-yellow mx-auto mt-2 rounded-full"></div>
      </div>

      {/* Input Area */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700 mb-6 shadow-xl backdrop-blur-sm">
        <form onSubmit={handlePost} className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0 border border-slate-600">
             <img src={currentUser.avatar_url} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
             <textarea 
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Talk smack or drop a comment..."
                className="w-full bg-slate-800 border-none rounded-xl p-3 text-white placeholder:text-slate-500 text-sm focus:ring-1 focus:ring-chalk resize-none h-20"
             />
             <div className="flex justify-between mt-2">
                <button
                    type="button"
                    onClick={handleGenerateSmack}
                    className="text-xs text-billiard-yellow hover:text-white flex items-center gap-1 transition-colors"
                >
                    <Sparkles className="w-3 h-3" /> AI Smack Talk
                </button>
                <Button size="sm" type="submit" disabled={!newPost.trim()} className="py-2 px-4 h-auto text-xs">
                    POST <Send className="w-3 h-3 ml-1" />
                </Button>
             </div>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div className="space-y-4 flex-1">
        {loading ? <div className="flex justify-center"><Loader2 className="animate-spin text-white"/></div> : (
            feed.map((item) => (
            <div key={item.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                {item.user.avatar_url ? (
                    <img src={item.user.avatar_url} className="w-10 h-10 rounded-full object-cover border border-slate-600" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-display font-bold text-slate-400 border border-slate-600">
                        {item.user.display_name.charAt(0)}
                    </div>
                )}
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start">
                    <div>
                        <span className="font-bold text-white text-sm mr-2">{item.user.display_name}</span>
                        <span className="text-xs text-slate-500">{item.timestamp}</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                        {getIconForType(item.type)}
                    </div>
                    </div>
                    
                    <p className={`text-sm mt-1 leading-relaxed ${item.type === 'system' ? 'text-chalk font-bold' : 'text-slate-300'}`}>
                        {item.content}
                    </p>

                    <div className="flex items-center gap-4 mt-3">
                        <button className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors group">
                            <Heart className="w-3 h-3 group-hover:fill-current" /> {item.likes}
                        </button>
                        {item.type !== 'system' && (
                            <button className="text-xs font-bold text-slate-500 hover:text-white transition-colors">
                                Reply
                            </button>
                        )}
                    </div>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
};
