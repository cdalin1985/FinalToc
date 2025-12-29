import React, { useEffect, useState } from 'react';
import { FeedItem } from '../types';
import { getFeed } from '../services/persistenceService';
import { Loader2 } from 'lucide-react';

export const Feed: React.FC = () => {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getFeed();
      setFeed(data);
    } catch (err) {
      console.error('Failed to load feed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, []);

  if (loading) return <div className="flex justify-center p-6"><Loader2 className="animate-spin text-white"/></div>;

  return (
    <div className="space-y-3">
      {feed.map(item => (
        <div key={item.id} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex gap-3">
          <div className="flex-shrink-0">
            {item.user?.avatar_url ? (
              <img src={item.user.avatar_url} className="w-10 h-10 rounded-full object-cover border border-slate-600" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-display font-bold text-slate-400 border border-slate-600">{item.user?.display_name?.charAt(0)}</div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-white text-sm mr-2">{item.user?.display_name}</span>
                <span className="text-xs text-slate-400">{item.timestamp}</span>
              </div>
            </div>

            <p className={`text-sm mt-1 leading-relaxed ${item.type === 'system' ? 'text-chalk font-bold' : 'text-slate-300'}`}>
              {item.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

