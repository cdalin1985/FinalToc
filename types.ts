export interface User {
  id: string;
  display_name: string;
  fargo_rate: number;
  robustness?: number; 
  rank: number;
  avatar_url?: string;
  is_claimed: boolean;
  email?: string;
  phone?: string;
  // Performance Stats
  wins: number;
  losses: number;
  discipline_stats: {
    '8-ball': { wins: number; losses: number };
    '9-ball': { wins: number; losses: number };
    '10-ball': { wins: number; losses: number };
  };
  challenges_made: number;
  challenges_accepted: number;
  avg_submission_hours: number;
  preferred_days: string[]; // e.g. ["Mon", "Wed", "Sun"]
  last_match_date?: string;
  matches_this_month: number;
}

export type Venue = 'Eagles 4040' | 'Valley Hub';

export interface Challenge {
  id: string;
  challenger_id: string;
  opponent_id: string;
  discipline: '8-ball' | '9-ball' | '10-ball';
  race_to: number;
  status: 'pending_logistics' | 'pending_confirmation' | 'accepted' | 'declined' | 'completed';
  venue?: Venue;
  scheduled_time?: string;
  created_at: string;
}

export interface Match {
  id: string;
  player1: User;
  player2: User;
  score1: number;
  score2: number;
  is_live: boolean;
  viewers: number;
}

export interface FeedItem {
  id: string;
  user: User;
  content: string;
  type: 'comment' | 'match_result' | 'challenge_update' | 'system';
  timestamp: string;
  likes: number;
}

export type ScreenName = 'auth' | 'ladder' | 'challenge' | 'feed' | 'profile' | 'payment';