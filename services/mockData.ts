import { User, Match, FeedItem } from '../types';

const createEmptyStats = () => ({
  wins: 0,
  losses: 0,
  discipline_stats: {
    '8-ball': { wins: 0, losses: 0 },
    '9-ball': { wins: 0, losses: 0 },
    '10-ball': { wins: 0, losses: 0 },
  },
  challenges_made: 0,
  challenges_accepted: 0,
  avg_submission_hours: 0,
  preferred_days: [],
  matches_this_month: 0,
});

const RAW_LIST = [
  { name: "Chase Dalin", fargo: 540, robustness: 324 },
  { name: "Dan Hamper", fargo: 637, robustness: 1319 },
  { name: "David Smith", fargo: 616, robustness: 241 },
  { name: "Frank Kincl", fargo: 626, robustness: 2671 },
  { name: "Dave Alderman", fargo: 580, robustness: 287 },
  { name: "Mike Zahn", fargo: 473, robustness: 122 },
  { name: "Mike Paliga", fargo: 586, robustness: 1200 },
  { name: "Tim Webster", fargo: null, robustness: null },
  { name: "Jerry Sabol", fargo: 502, robustness: 626 },
  { name: "Thomas E. Kingston", fargo: 475, robustness: 133 },
  { name: "Timmy Squires", fargo: 558, robustness: 588 },
  { name: "Joel Selzer", fargo: 429, robustness: 208 },
  { name: "Josh Fava", fargo: 572, robustness: 409 },
  { name: "Eric Croft", fargo: null, robustness: null },
  { name: "Louise Broksle", fargo: null, robustness: null },
  { name: "Kurt Kubicka", fargo: 492, robustness: 686 },
  { name: "George Cotton", fargo: 399, robustness: 17 },
  { name: "Vern Carpenter", fargo: null, robustness: null },
  { name: "Mike Churchill", fargo: null, robustness: null },
  { name: "Chris Gomez", fargo: 372, robustness: 299 },
  { name: "Matt Gilbert", fargo: 450, robustness: 117 },
  { name: "Gurn Blanston", fargo: null, robustness: null },
  { name: "Rob Millions", fargo: null, robustness: null },
  { name: "Walker Hopkins", fargo: 407, robustness: 430 },
  { name: "Janice Osborne", fargo: 378, robustness: 340 },
  { name: "Anthony Jacobs", fargo: 440, robustness: 620 },
  { name: "Patrick Donald", fargo: null, robustness: null },
  { name: "Tim Gregor", fargo: null, robustness: null },
  { name: "James McMasters", fargo: null, robustness: null },
  { name: "Joe Mackay", fargo: 417, robustness: 160 },
  { name: "Steve Adsem", fargo: 487, robustness: 514 },
  { name: "Samantha Chase", fargo: 241, robustness: 136 },
  { name: "Lea Hightshoe", fargo: null, robustness: null },
  { name: "Courtney Norman", fargo: 230, robustness: 213 },
  { name: "Marc Sanche", fargo: 413, robustness: 294 },
  { name: "Kenny Thurman", fargo: null, robustness: null },
  { name: "Roger Simmons", fargo: null, robustness: null },
  { name: "Christina Talbot", fargo: 469, robustness: 84 },
  { name: "Jon Nash", fargo: 418, robustness: 32 },
  { name: "Sady Garrison", fargo: 329, robustness: 45 },
  { name: "Justin Cavazos", fargo: null, robustness: null },
  { name: "Sean Royston", fargo: null, robustness: null },
  { name: "James Smith", fargo: null, robustness: null },
  { name: "Zach Ledesma", fargo: 492, robustness: 145 },
  { name: "Clayton Carter", fargo: null, robustness: null },
  { name: "Ryan Fields", fargo: null, robustness: null },
  { name: "Kris Vladic", fargo: null, robustness: null },
  { name: "Nate Welch", fargo: 476, robustness: 629 },
  { name: "Josh Hill", fargo: 455, robustness: 1134 },
  { name: "Josh Waples", fargo: 369, robustness: 212 },
  { name: "Steven Ross Brandenburg", fargo: -90, robustness: 0 },
  { name: "Troy Jacobs", fargo: 403, robustness: 80 },
  { name: "Makayla Ledford", fargo: 294, robustness: 160 },
  { name: "Sarah Urbaniak VanCleave", fargo: 447, robustness: 16 },
  { name: "Jennifer Lynn", fargo: null, robustness: null },
  { name: "Walter Ryan Isenhour", fargo: 478, robustness: 251 },
  { name: "Craig Rogers", fargo: 393, robustness: 30 },
  { name: "Jesse Chandler", fargo: 444, robustness: 76 },
  { name: "Tizer Rushford", fargo: 401, robustness: 144 },
  { name: "Randy Hoag", fargo: 512, robustness: 396 },
  { name: "Justin Whittenberg", fargo: null, robustness: null },
  { name: "Kenrick Leistiko", fargo: null, robustness: null },
  { name: "Richard Frankforter", fargo: null, robustness: null },
  { name: "Brandon Lucas Parker", fargo: null, robustness: null },
  { name: "James Ellington", fargo: 408, robustness: 90 },
  { name: "Anita Scharf", fargo: null, robustness: null },
  { name: "Ileana Hernandez", fargo: null, robustness: null },
  { name: "Heather Jarvis", fargo: 293, robustness: 150 },
  { name: "Keenen Blackbird", fargo: 388, robustness: 104 },
  { name: "Kelly Smail", fargo: 303, robustness: 236 }
];

export const INITIAL_ROSTER: User[] = RAW_LIST.map((p, idx) => ({
  id: (idx + 1).toString(),
  rank: idx + 1,
  display_name: p.name,
  fargo_rate: p.fargo || 0,
  robustness: p.robustness || 0,
  is_claimed: false,
  ...createEmptyStats()
}));

// Starting from scratch - no historical matches
export const INITIAL_MATCHES: Match[] = [];

export const INITIAL_FEED: FeedItem[] = [
  {
    id: 'f_zero',
    user: INITIAL_ROSTER[0], // First player as placeholder system announcer
    content: 'The Eternal List has been synchronized. All 70 positions are initialized for Season 2025. The grind begins now.',
    type: 'system',
    timestamp: 'Just now',
    likes: 0
  }
];