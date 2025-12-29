
export interface User {
  id: string;
  display_name: string;
  fargo_rate: number;
  rank: number;
  avatar_url?: string;
  is_claimed: boolean;
  email?: string;
  phone?: string;
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
  timestamp: string; // ISO string or relative time string for mock
  likes: number;
}

export type ScreenName = 'auth' | 'dashboard' | 'ladder' | 'challenge' | 'stream' | 'profile' | 'coach' | 'action-board' | 'payment';