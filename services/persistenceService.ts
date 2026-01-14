import { User, Challenge, FeedItem, Match } from '../types';
import { supabase, hasValidSupabaseConfig } from './supabaseClient';
import { INITIAL_ROSTER, INITIAL_FEED } from './mockData';

const isSupabaseReady = () => {
    return hasValidSupabaseConfig && !!supabase;
};

// --- Storage Management ---

const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      const rawFeed = localStorage.getItem('feed_items');
      if (rawFeed) {
        const feed = JSON.parse(rawFeed);
        localStorage.setItem('feed_items', JSON.stringify(feed.slice(0, 5)));
        try {
          localStorage.setItem(key, value);
          return true;
        } catch (err) { return false; }
      }
    }
    return false;
  }
};

// --- Budgeting ---
export const getPrestigeTokens = (userId: string): number => {
  const key = `prestige_tokens_${userId}`;
  const used = parseInt(localStorage.getItem(key) || '0');
  return Math.max(0, 2 - used);
};

export const recordPrestigeGeneration = (userId: string) => {
  const key = `prestige_tokens_${userId}`;
  const used = parseInt(localStorage.getItem(key) || '0');
  localStorage.setItem(key, (used + 1).toString());
};

export const canPlayerGenerate = (userId: string): boolean => {
  const usageKey = `total_ai_usage_${userId}_${new Date().getMonth()}`;
  const usedCount = parseInt(localStorage.getItem(usageKey) || '0');
  return usedCount < 10;
};

export const recordGeneration = (userId: string) => {
  const usageKey = `total_ai_usage_${userId}_${new Date().getMonth()}`;
  const usedCount = parseInt(localStorage.getItem(usageKey) || '0');
  localStorage.setItem(usageKey, (usedCount + 1).toString());
};

// --- Data Synchronization ---

export const initializeData = async () => {
  if (!isSupabaseReady()) return;
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) return;

    if (count === 0 || count === null) {
      console.log("Empty database detected. Seeding 70-player Eternal List...");
      const seedData = INITIAL_ROSTER.map(u => ({
        id: u.id,
        display_name: u.display_name,
        fargo_rate: u.fargo_rate,
        robustness: u.robustness || 0,
        rank: u.rank,
        is_claimed: false,
        avatar_url: u.avatar_url || null,
        wins: u.wins,
        losses: u.losses,
        discipline_stats: u.discipline_stats,
        challenges_made: u.challenges_made,
        challenges_accepted: u.challenges_accepted,
        avg_submission_hours: u.avg_submission_hours,
        preferred_days: u.preferred_days,
        matches_this_month: u.matches_this_month
      }));
      
      const { error: insertError } = await supabase.from('profiles').insert(seedData);
      if (!insertError) {
        const firstFeed = INITIAL_FEED[0];
        await supabase.from('feed').insert({
            id: firstFeed.id,
            user_id: firstFeed.user.id,
            content: firstFeed.content,
            type: firstFeed.type,
            likes: firstFeed.likes || 0,
            timestamp: new Date().toISOString()
        });
      }
    }
  } catch (err) {
    console.error("Init failed:", err);
  }
};

export const subscribeToTable = (table: string, callback: (payload: any) => void) => {
    if (!isSupabaseReady()) return () => {};
    const channel = supabase
        .channel(`public:${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
            callback(payload);
        })
        .subscribe();
    return () => { supabase.removeChannel(channel); };
};

export const getUsers = async (): Promise<User[]> => {
  if (!isSupabaseReady()) return INITIAL_ROSTER;
  const { data, error } = await supabase.from('profiles').select('*').order('rank', { ascending: true });
  return error ? INITIAL_ROSTER : data as User[];
};

export const updateUser = async (updatedUser: User) => {
  if (!isSupabaseReady()) throw new Error("Supabase disconnected");
  const { error } = await supabase.from('profiles').update({
    display_name: updatedUser.display_name,
    fargo_rate: updatedUser.fargo_rate,
    robustness: updatedUser.robustness,
    rank: updatedUser.rank,
    avatar_url: updatedUser.avatar_url,
    is_claimed: updatedUser.is_claimed,
    email: updatedUser.email,
    phone: updatedUser.phone,
    wins: updatedUser.wins,
    losses: updatedUser.losses,
    discipline_stats: updatedUser.discipline_stats,
    challenges_made: updatedUser.challenges_made,
    challenges_accepted: updatedUser.challenges_accepted,
    avg_submission_hours: updatedUser.avg_submission_hours,
    preferred_days: updatedUser.preferred_days,
    matches_this_month: updatedUser.matches_this_month
  }).eq('id', updatedUser.id);
  if (error) throw error;
};

export const getCurrentUser = (): User | null => {
  try {
    const data = localStorage.getItem('top_of_capital_user');
    return data ? JSON.parse(data) : null;
  } catch { return null; }
};

export const setCurrentUserSession = (user: User) => {
  localStorage.setItem('top_of_capital_user', JSON.stringify(user));
};

export const logoutUser = () => {
  localStorage.removeItem('top_of_capital_user');
};

export const getChallenges = async (): Promise<Challenge[]> => {
  if (!isSupabaseReady()) return [];
  const { data, error } = await supabase.from('challenges').select('*').order('created_at', { ascending: false });
  return error ? [] : data as Challenge[];
};

export const getUserActionItems = async (userId: string): Promise<Challenge[]> => {
  if (!isSupabaseReady()) return [];
  const { data, error } = await supabase.from('challenges')
    .select('*')
    .or(`and(opponent_id.eq.${userId},status.eq.pending_logistics),and(challenger_id.eq.${userId},status.eq.pending_confirmation),status.eq.accepted`);
  return error ? [] : data as Challenge[];
};

export const saveChallenge = async (challenge: Challenge) => {
  if (!isSupabaseReady()) return;
  await supabase.from('challenges').upsert(challenge);
};

export const deleteChallenge = async (id: string) => {
    if (!isSupabaseReady()) return;
    await supabase.from('challenges').delete().eq('id', id);
};

export const getFeed = async (): Promise<FeedItem[]> => {
  if (!isSupabaseReady()) return [];
  const { data, error } = await supabase.from('feed')
    .select('*, profiles(*)')
    .order('timestamp', { ascending: false })
    .limit(30);
  
  if (error || !data) return [];
  return data.map((item: any) => ({
    id: item.id,
    content: item.content,
    type: item.type,
    likes: item.likes || 0,
    timestamp: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    user: item.profiles || INITIAL_ROSTER[0]
  }));
};

export const addFeedItem = async (item: FeedItem) => {
  if (!isSupabaseReady()) return;
  await supabase.from('feed').insert({
    id: item.id,
    user_id: item.user.id,
    content: item.content,
    type: item.type,
    likes: item.likes || 0,
    timestamp: new Date().toISOString()
  });
};