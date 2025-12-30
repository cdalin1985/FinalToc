import { User, Challenge, FeedItem, Match } from '../types';
import { supabase } from './supabaseClient';
import { INITIAL_ROSTER, INITIAL_FEED, INITIAL_MATCHES } from './mockData';

// --- Initialization ---

export const initializeData = async () => {
  // 1. Seed Profiles
  const { count: profileCount, error: profileError } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  
  if (!profileError && (profileCount === 0 || profileCount === null)) {
      console.log("Seeding Database with Initial Roster...");
      // Seed users
      const { error: seedError } = await supabase.from('profiles').insert(INITIAL_ROSTER);
      if (seedError) console.error("Error seeding roster:", seedError);
  }

  // 2. Seed Feed
  const { count: feedCount, error: feedError } = await supabase.from('feed_items').select('*', { count: 'exact', head: true });
  
  if (!feedError && (feedCount === 0 || feedCount === null)) {
      console.log("Seeding Database with Initial Feed...");
      // Map mock feed to DB structure (renaming user -> user_data)
      const dbFeed = INITIAL_FEED.map(item => ({
          id: item.id,
          user_data: item.user,
          content: item.content,
          type: item.type,
          likes: item.likes,
          timestamp: item.timestamp,
          created_at: new Date().toISOString()
      }));

      const { error: seedError } = await supabase.from('feed_items').insert(dbFeed);
      if (seedError) console.error("Error seeding feed:", seedError);
  }
};

// --- Users ---

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('rank', { ascending: true });
  
  if (error || !data || data.length === 0) {
      // console.error("Error fetching users (falling back to mock):", error);
      return INITIAL_ROSTER;
  }
  return data as User[];
};

export const updateUser = async (updatedUser: User) => {
  // Update in DB
  const { error } = await supabase
    .from('profiles')
    .update(updatedUser)
    .eq('id', updatedUser.id);
    
  if (error) console.error("Error updating user:", error);

  // Update local session if needed
  const session = getCurrentUser(); // This is synchronous local storage for session only
  if (session && session.id === updatedUser.id) {
    localStorage.setItem('top_of_capital_user', JSON.stringify(updatedUser));
  }
};

// We still keep the *session* in local storage for now to persist login state 
// across refreshes without full Auth implementation overhead in this step
export const getCurrentUser = (): User | null => {
  try {
    return JSON.parse(localStorage.getItem('top_of_capital_user') || 'null');
  } catch { return null; }
};

export const setCurrentUserSession = (user: User) => {
    localStorage.setItem('top_of_capital_user', JSON.stringify(user));
}

export const logoutUser = () => {
  localStorage.removeItem('top_of_capital_user');
}

// --- Challenges ---

export const getChallenges = async (): Promise<Challenge[]> => {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { 
      console.error(error); 
      return []; 
  }
  return data as Challenge[];
};

export const getUserActionItems = async (userId: string): Promise<Challenge[]> => {
  // Logic: 
  // 1. I am Opponent AND status is pending_logistics
  // 2. I am Challenger AND status is pending_confirmation
  
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .or(`and(opponent_id.eq.${userId},status.eq.pending_logistics),and(challenger_id.eq.${userId},status.eq.pending_confirmation)`)
    .order('created_at', { ascending: false });

  if (error) {
      console.error(error);
      return [];
  }
  return data as Challenge[];
};

// Alias for legacy support
export const getIncomingChallenges = getUserActionItems;

export const saveChallenge = async (challenge: Challenge) => {
  // Check if it exists to decide update vs insert
  // We use upsert for simplicity if ID is preserved
  const { error } = await supabase
    .from('challenges')
    .upsert(challenge);

  if (error) console.error("Error saving challenge:", error);
  
  // --- Feed Logic (Server-side triggers are better, but client-side for now) ---
  
  // 1. New Challenge
  if (challenge.status === 'pending_logistics') {
      // Fetch names for feed
      const { data: challenger } = await supabase.from('profiles').select('display_name').eq('id', challenge.challenger_id).single();
      const { data: opponent } = await supabase.from('profiles').select('display_name').eq('id', challenge.opponent_id).single();
      
      if (challenger && opponent) {
         // Check if feed item already exists to avoid dupes on updates (simple check)
         // In production, backend handles this.
         const feedId = `chal_${challenge.id}`;
         const { data: existing } = await supabase.from('feed_items').select('id').eq('id', feedId).maybeSingle();
         
         if (!existing) {
             const userForFeed = await supabase.from('profiles').select('*').eq('id', challenge.challenger_id).single();
             if (userForFeed.data) {
                await addFeedItem({
                    id: feedId,
                    user: userForFeed.data,
                    content: `Has challenged ${opponent.display_name} to a race to ${challenge.race_to} in ${challenge.discipline}!`,
                    type: 'challenge_update',
                    timestamp: new Date().toISOString(),
                    likes: 0
                });
             }
         }
      }
  }

  // 3. Match Accepted
  if (challenge.status === 'accepted') {
      const feedId = `match_${challenge.id}`;
      const { data: existing } = await supabase.from('feed_items').select('id').eq('id', feedId).maybeSingle();
      
      if (!existing) {
        const { data: challenger } = await supabase.from('profiles').select('display_name').eq('id', challenge.challenger_id).single();
        const { data: opponent } = await supabase.from('profiles').select('display_name').eq('id', challenge.opponent_id).single();
        
        if (challenger && opponent) {
             await addFeedItem({
                id: feedId,
                user: { id: 'sys', display_name: 'League Bot', rank: 0, fargo_rate: 0, is_claimed: false } as User,
                content: `MATCH SET: ${challenger.display_name} vs ${opponent.display_name} @ ${challenge.venue} on ${new Date(challenge.scheduled_time!).toLocaleDateString()}.`,
                type: 'system',
                timestamp: new Date().toISOString(),
                likes: 0
            });
        }
      }
  }
};

// --- Feed ---

export const getFeed = async (): Promise<FeedItem[]> => {
  const { data, error } = await supabase
    .from('feed_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
      return INITIAL_FEED;
  }
  
  // Transform DB rows to Types
  // We map 'user_data' (DB column) back to 'user' (App type)
  return data.map((d: any) => ({
      ...d,
      user: d.user_data,
      timestamp: new Date(d.created_at).toLocaleString() // Simple format
  })) as FeedItem[];
};

export const addFeedItem = async (item: FeedItem) => {
  const { error } = await supabase
    .from('feed_items')
    .insert({
        id: item.id,
        user_data: item.user, // Save to 'user_data' column to avoid reserved keyword 'user'
        content: item.content,
        type: item.type,
        likes: item.likes,
        created_at: new Date().toISOString()
    });
    
  if (error) console.error("Feed error:", error);
};

// --- Matches ---

export const getMatches = async (): Promise<Match[]> => {
   // Assuming simple table for now
   return INITIAL_MATCHES;
}