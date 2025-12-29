import { User, Match, FeedItem, Challenge } from '../types';
import { getChallenges } from './persistenceService'; // Legacy support if imports linger

// Real-life league roster based on provided rankings
// This acts as the SEED data for the database
export const INITIAL_ROSTER: User[] = [
  { id: '1', rank: 1, display_name: 'Dan Hamper', fargo_rate: 650, is_claimed: false },
  { id: '2', rank: 2, display_name: 'Mike Paliga', fargo_rate: 646, is_claimed: false },
  { id: '3', rank: 3, display_name: 'David Smith', fargo_rate: 642, is_claimed: false },
  { id: '4', rank: 4, display_name: 'Chase Dalin', fargo_rate: 638, is_claimed: false },
  { id: '5', rank: 5, display_name: 'Mike Zahn', fargo_rate: 634, is_claimed: false },
  { id: '6', rank: 6, display_name: 'Frank Kincl', fargo_rate: 630, is_claimed: false },
  { id: '7', rank: 7, display_name: 'Dave Alderman', fargo_rate: 626, is_claimed: false },
  { id: '8', rank: 8, display_name: 'Tim Webster', fargo_rate: 622, is_claimed: false },
  { id: '9', rank: 9, display_name: 'Jerry Sabol', fargo_rate: 618, is_claimed: false },
  { id: '10', rank: 10, display_name: 'Josh Fava', fargo_rate: 614, is_claimed: false },
  { id: '11', rank: 11, display_name: 'Thomas E. Kingston', fargo_rate: 610, is_claimed: false },
  { id: '12', rank: 12, display_name: 'Timmy Squires', fargo_rate: 606, is_claimed: false },
  { id: '13', rank: 13, display_name: 'Eric Croft', fargo_rate: 602, is_claimed: false },
  { id: '14', rank: 14, display_name: 'Kenny Thurman', fargo_rate: 598, is_claimed: false },
  { id: '15', rank: 15, display_name: 'Vern Carpenter', fargo_rate: 594, is_claimed: false },
  { id: '16', rank: 16, display_name: 'Louise Broksle', fargo_rate: 590, is_claimed: false },
  { id: '17', rank: 17, display_name: 'Kurt Kubicka', fargo_rate: 586, is_claimed: false },
  { id: '18', rank: 18, display_name: 'Chris Gomez', fargo_rate: 582, is_claimed: false },
  { id: '19', rank: 19, display_name: 'George Cotton', fargo_rate: 578, is_claimed: false },
  { id: '20', rank: 20, display_name: 'Anthony Jacobs', fargo_rate: 574, is_claimed: false },
  { id: '21', rank: 21, display_name: 'Mike Churchill', fargo_rate: 570, is_claimed: false },
  { id: '22', rank: 22, display_name: 'Matt Gilbert', fargo_rate: 566, is_claimed: false },
  { id: '23', rank: 23, display_name: 'Gurn Blanston', fargo_rate: 562, is_claimed: false },
  { id: '24', rank: 24, display_name: 'Rob Millions', fargo_rate: 558, is_claimed: false },
  { id: '25', rank: 25, display_name: 'Walker Hopkins', fargo_rate: 554, is_claimed: false },
  { id: '26', rank: 26, display_name: 'Janice Osborne', fargo_rate: 550, is_claimed: false },
  { id: '27', rank: 27, display_name: 'Patrick Donald', fargo_rate: 546, is_claimed: false },
  { id: '28', rank: 28, display_name: 'Tim Gregor', fargo_rate: 542, is_claimed: false },
  { id: '29', rank: 29, display_name: 'James McMasters', fargo_rate: 538, is_claimed: false },
  { id: '30', rank: 30, display_name: 'Joe Mackay', fargo_rate: 534, is_claimed: false },
  { id: '31', rank: 31, display_name: 'Steve Adsem', fargo_rate: 530, is_claimed: false },
  { id: '32', rank: 32, display_name: 'Josh Waples', fargo_rate: 526, is_claimed: false },
  { id: '33', rank: 33, display_name: 'Samantha Chase', fargo_rate: 522, is_claimed: false },
  { id: '34', rank: 34, display_name: 'Lea Hightshoe', fargo_rate: 518, is_claimed: false },
  { id: '35', rank: 35, display_name: 'Courtney Norman', fargo_rate: 514, is_claimed: false },
  { id: '36', rank: 36, display_name: 'Marc Sanche', fargo_rate: 510, is_claimed: false },
  { id: '37', rank: 37, display_name: 'Roger Simmons', fargo_rate: 506, is_claimed: false },
  { id: '38', rank: 38, display_name: 'Christina Talbot', fargo_rate: 502, is_claimed: false },
  { id: '39', rank: 39, display_name: 'Jon Nash', fargo_rate: 498, is_claimed: false },
  { id: '40', rank: 40, display_name: 'Sady Garrison', fargo_rate: 494, is_claimed: false },
  { id: '41', rank: 41, display_name: 'Justin Cavazos', fargo_rate: 490, is_claimed: false },
  { id: '42', rank: 42, display_name: 'Sean Royston', fargo_rate: 486, is_claimed: false },
  { id: '43', rank: 43, display_name: 'James Smith', fargo_rate: 482, is_claimed: false },
  { id: '44', rank: 44, display_name: 'Zach Ledesma', fargo_rate: 478, is_claimed: false },
  { id: '45', rank: 45, display_name: 'Clayton Carter', fargo_rate: 474, is_claimed: false },
  { id: '46', rank: 46, display_name: 'Ryan Fields', fargo_rate: 470, is_claimed: false },
  { id: '47', rank: 47, display_name: 'Kris Vladic', fargo_rate: 466, is_claimed: false },
  { id: '48', rank: 48, display_name: 'Nate Welch', fargo_rate: 462, is_claimed: false },
  { id: '49', rank: 49, display_name: 'Josh Hill', fargo_rate: 458, is_claimed: false },
  { id: '50', rank: 50, display_name: 'Steven Ross Brandenburg', fargo_rate: 454, is_claimed: false },
  { id: '51', rank: 51, display_name: 'Troy Jacobs', fargo_rate: 450, is_claimed: false },
  { id: '52', rank: 52, display_name: 'Makayla Ledford', fargo_rate: 446, is_claimed: false },
  { id: '53', rank: 53, display_name: 'Sarah Urbaniak VanCleave', fargo_rate: 442, is_claimed: false },
  { id: '54', rank: 54, display_name: 'Jennifer Lynn', fargo_rate: 438, is_claimed: false },
  { id: '55', rank: 55, display_name: 'Walter Ryan Isenhour', fargo_rate: 434, is_claimed: false },
  { id: '56', rank: 56, display_name: 'Craig Rogers', fargo_rate: 430, is_claimed: false },
  { id: '57', rank: 57, display_name: 'Jesse Chandler', fargo_rate: 426, is_claimed: false },
  { id: '58', rank: 58, display_name: 'Tizer Rushford', fargo_rate: 422, is_claimed: false },
  { id: '59', rank: 59, display_name: 'Randy Hoag', fargo_rate: 418, is_claimed: false },
  { id: '60', rank: 60, display_name: 'Justin Whittenberg', fargo_rate: 414, is_claimed: false },
  { id: '61', rank: 61, display_name: 'Kenrick Leistiko', fargo_rate: 410, is_claimed: false },
  { id: '62', rank: 62, display_name: 'Richard Frankforter', fargo_rate: 406, is_claimed: false },
  { id: '63', rank: 63, display_name: 'Justin Huth', fargo_rate: 402, is_claimed: false },
  { id: '64', rank: 64, display_name: 'Brandon Lucas Parker', fargo_rate: 398, is_claimed: false },
  { id: '65', rank: 65, display_name: 'James Ellington', fargo_rate: 394, is_claimed: false },
  { id: '66', rank: 66, display_name: 'Anita Scharf', fargo_rate: 390, is_claimed: false },
  { id: '67', rank: 67, display_name: 'Ileana Hernandez', fargo_rate: 386, is_claimed: false },
  { id: '68', rank: 68, display_name: 'Heather Jarvis', fargo_rate: 382, is_claimed: false },
  { id: '69', rank: 69, display_name: 'Keenen Blackbird', fargo_rate: 378, is_claimed: false },
  { id: '70', rank: 70, display_name: 'Vicki Clem', fargo_rate: 374, is_claimed: false },
  { id: '71', rank: 71, display_name: 'Kelly Smail', fargo_rate: 370, is_claimed: false },
  { id: '72', rank: 72, display_name: 'Kevin Croft', fargo_rate: 366, is_claimed: false },
  { id: '73', rank: 73, display_name: 'Jake Nicholls', fargo_rate: 362, is_claimed: false },
];

export const INITIAL_MATCHES: Match[] = [
  {
    id: 'm1',
    player1: INITIAL_ROSTER[0], // Dan Hamper
    player2: INITIAL_ROSTER[1], // Mike Paliga
    score1: 7,
    score2: 5,
    is_live: true,
    viewers: 1240,
  },
  {
    id: 'm2',
    player1: INITIAL_ROSTER[2], // David Smith
    player2: INITIAL_ROSTER[3], // Chase Dalin
    score1: 2,
    score2: 9,
    is_live: false,
    viewers: 0,
  }
];

export const INITIAL_FEED: FeedItem[] = [
  {
    id: 'f1',
    user: INITIAL_ROSTER[0],
    content: 'Just swept the floor with Mike Paliga. 7-5. Who wants next?',
    type: 'comment',
    timestamp: '2 hours ago',
    likes: 15
  },
  {
    id: 'f2',
    user: { ...INITIAL_ROSTER[4], avatar_url: 'https://i.pravatar.cc/150?u=pool_player_zahn' },
    content: 'Challenge issued to Dan Hamper. Race to 9. 9-Ball.',
    type: 'challenge_update',
    timestamp: '4 hours ago',
    likes: 8
  },
  {
    id: 'f3',
    user: { id: 'sys', display_name: 'League Bot', rank: 0, fargo_rate: 0, is_claimed: false },
    content: 'Reminder: Weekly tournament sign-ups close tonight at 8 PM at Valley Hub.',
    type: 'system',
    timestamp: '5 hours ago',
    likes: 24
  },
  {
    id: 'f4',
    user: INITIAL_ROSTER[2],
    content: 'Anyone heading to Eagles tonight for some practice racks?',
    type: 'comment',
    timestamp: '1 day ago',
    likes: 3
  }
];

// Helper to keep existing code happy if it imports MOCK_USERS directly
// (Ideally we remove this, but for safe refactoring we alias it for now)
export const MOCK_USERS = INITIAL_ROSTER; 
export const MOCK_FEED = INITIAL_FEED;
export const MOCK_MATCHES = INITIAL_MATCHES;

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Keep legacy export for compatibility until full refactor
export { getIncomingChallenges, saveChallenge } from './persistenceService';