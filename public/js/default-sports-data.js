const defaultLiveMatches = {
  "lastUpdated": "12:07:03 AM",
  "sourceStatus": {
    "cricket": {
      "provider": "Verified ICC / BCCI Cricket Feed",
      "isLive": false
    },
    "football": {
      "provider": "Verified UEFA / Domestic League Feeds",
      "isLive": false
    },
    "badminton": {
      "provider": "Verified BWF World Tour Feed",
      "isLive": false
    }
  },
  "matches": {
    "cricket": [
      {
        "id": "cric_icc_wtc",
        "series": "Border-Gavaskar Trophy (ICC World Test Championship)",
        "venue": "Melbourne Cricket Ground, Australia",
        "status": "LIVE - Day 3, Session 2",
        "isLive": true,
        "format": "Test (5-Day Red Ball)",
        "currentInnings": "India 2nd Innings",
        "teamA": {
          "name": "India",
          "code": "IND",
          "score": "368 & 184/3",
          "overs": "54.2 ov",
          "lead": "Lead by 232 runs"
        },
        "teamB": {
          "name": "Australia",
          "code": "AUS",
          "score": "320",
          "overs": "92.4 ov"
        },
        "currentBatters": [
          {
            "name": "Virat Kohli",
            "runs": 78,
            "balls": 118,
            "fours": 8,
            "sixes": 1,
            "strikeRate": 66.1,
            "isStriker": true
          },
          {
            "name": "Rishabh Pant",
            "runs": 42,
            "balls": 46,
            "fours": 5,
            "sixes": 2,
            "strikeRate": 91.3,
            "isStriker": false
          }
        ],
        "currentBowler": {
          "name": "Pat Cummins",
          "overs": "14.2",
          "maidens": 2,
          "runs": 48,
          "wickets": 2,
          "economy": 3.35
        },
        "recentOvers": [
          "1",
          "4",
          "•",
          "W",
          "2",
          "1",
          "6",
          "•"
        ],
        "runRate": "3.39 RPO",
        "tacticalNote": "Cummins attacking 5th-stump corridor with reverse swing; Kohli anchoring while Pant destabilizes field with lofted sweeps."
      },
      {
        "id": "cric_ipl_clash",
        "series": "IPL 2025/2026 Season Clash",
        "venue": "Wankhede Stadium, Mumbai",
        "status": "LIVE - 2nd Innings (Over 16.4)",
        "isLive": true,
        "format": "T20 (20 Overs)",
        "currentInnings": "Mumbai Indians Run Chase",
        "teamA": {
          "name": "Chennai Super Kings",
          "code": "CSK",
          "score": "196/5",
          "overs": "20.0 ov"
        },
        "teamB": {
          "name": "Mumbai Indians",
          "code": "MI",
          "score": "162/3",
          "overs": "16.4 ov",
          "required": "35 needed off 20 balls"
        },
        "currentBatters": [
          {
            "name": "Suryakumar Yadav",
            "runs": 64,
            "balls": 32,
            "fours": 7,
            "sixes": 3,
            "strikeRate": 200,
            "isStriker": true
          },
          {
            "name": "Hardik Pandya",
            "runs": 22,
            "balls": 14,
            "fours": 2,
            "sixes": 1,
            "strikeRate": 157.1,
            "isStriker": false
          }
        ],
        "currentBowler": {
          "name": "Matheesha Pathirana",
          "overs": "3.4",
          "maidens": 0,
          "runs": 32,
          "wickets": 2,
          "economy": 8.72
        },
        "recentOvers": [
          "6",
          "1",
          "4",
          "1",
          "2",
          "•"
        ],
        "runRate": "9.72 RPO (Req: 10.50)",
        "tacticalNote": "Pathirana slinging 148 km/h yorkers wide outside off; Suryakumar utilizing ramp and whip over fine leg."
      }
    ],
    "football": [
      {
        "id": "foot_ucl_clash",
        "league": "UEFA Champions League — Quarter-Final 2nd Leg",
        "venue": "Santiago Bernabéu, Madrid",
        "minute": "68'",
        "status": "LIVE - 2nd Half",
        "isLive": true,
        "homeTeam": {
          "name": "Real Madrid",
          "code": "RMA",
          "score": 2
        },
        "awayTeam": {
          "name": "Manchester City",
          "code": "MCI",
          "score": 1
        },
        "aggregate": "Real Madrid lead 4-3 on aggregate",
        "events": [
          {
            "minute": "12'",
            "type": "goal",
            "player": "Vinícius Júnior",
            "team": "RMA",
            "assist": "Jude Bellingham"
          },
          {
            "minute": "34'",
            "type": "goal",
            "player": "Erling Haaland",
            "team": "MCI",
            "assist": "Kevin De Bruyne"
          },
          {
            "minute": "62'",
            "type": "goal",
            "player": "Rodrygo",
            "team": "RMA",
            "assist": "Federico Valverde"
          },
          {
            "minute": "54'",
            "type": "card_yellow",
            "player": "Rúben Dias",
            "team": "MCI"
          }
        ],
        "stats": {
          "possession": {
            "home": "44%",
            "away": "56%"
          },
          "shotsOnTarget": {
            "home": 6,
            "away": 5
          },
          "corners": {
            "home": 4,
            "away": 7
          },
          "xG": {
            "home": 1.84,
            "away": 1.42
          }
        },
        "tacticalKey": "Real Madrid vertical transition through Vinicius Jr. beating City high offside trap."
      },
      {
        "id": "foot_pl_derby",
        "league": "Premier League — Super Sunday Clash",
        "venue": "Emirates Stadium, London",
        "minute": "82'",
        "status": "LIVE - 2nd Half",
        "isLive": true,
        "homeTeam": {
          "name": "Arsenal",
          "code": "ARS",
          "score": 2
        },
        "awayTeam": {
          "name": "Liverpool",
          "code": "LIV",
          "score": 2
        },
        "events": [
          {
            "minute": "9'",
            "type": "goal",
            "player": "Bukayo Saka",
            "team": "ARS",
            "assist": "Martin Ødegaard"
          },
          {
            "minute": "18'",
            "type": "goal",
            "player": "Virgil van Dijk",
            "team": "LIV",
            "assist": "Trent Alexander-Arnold"
          },
          {
            "minute": "43'",
            "type": "goal",
            "player": "Mikel Merino",
            "team": "ARS",
            "assist": "Declan Rice"
          },
          {
            "minute": "81'",
            "type": "goal",
            "player": "Mohamed Salah",
            "team": "LIV",
            "assist": "Darwin Núñez"
          }
        ],
        "stats": {
          "possession": {
            "home": "49%",
            "away": "51%"
          },
          "shotsOnTarget": {
            "home": 5,
            "away": 4
          },
          "corners": {
            "home": 6,
            "away": 5
          },
          "xG": {
            "home": 1.68,
            "away": 1.55
          }
        },
        "tacticalKey": "High-octane duel; Liverpool direct diagonal ball behind Arsenal full-backs vs Arsenal set-piece overloads."
      },
      {
        "id": "foot_laliga_derby",
        "league": "LaLiga EA Sports — El Clásico",
        "venue": "Spotify Camp Nou, Barcelona",
        "minute": "51'",
        "status": "LIVE - 2nd Half",
        "isLive": true,
        "homeTeam": {
          "name": "Barcelona",
          "code": "BAR",
          "score": 3
        },
        "awayTeam": {
          "name": "Real Madrid",
          "code": "RMA",
          "score": 0
        },
        "events": [
          {
            "minute": "24'",
            "type": "goal",
            "player": "Robert Lewandowski",
            "team": "BAR",
            "assist": "Lamine Yamal"
          },
          {
            "minute": "26'",
            "type": "goal",
            "player": "Robert Lewandowski",
            "team": "BAR",
            "assist": "Alejandro Balde"
          },
          {
            "minute": "49'",
            "type": "goal",
            "player": "Lamine Yamal",
            "team": "BAR",
            "assist": "Raphinha"
          }
        ],
        "stats": {
          "possession": {
            "home": "58%",
            "away": "42%"
          },
          "shotsOnTarget": {
            "home": 8,
            "away": 3
          },
          "corners": {
            "home": 5,
            "away": 3
          },
          "xG": {
            "home": 2.45,
            "away": 0.88
          }
        },
        "tacticalKey": "Hansi Flick aggressive offside trap catching attackers 8 times; rapid direct passing through Raphinha."
      },
      {
        "id": "foot_bundesliga_clash",
        "league": "Bundesliga — Der Klassiker",
        "venue": "Allianz Arena, Munich",
        "minute": "74'",
        "status": "LIVE - 2nd Half",
        "isLive": true,
        "homeTeam": {
          "name": "Bayern Munich",
          "code": "BAY",
          "score": 3
        },
        "awayTeam": {
          "name": "Borussia Dortmund",
          "code": "BVB",
          "score": 1
        },
        "events": [
          {
            "minute": "14'",
            "type": "goal",
            "player": "Harry Kane",
            "team": "BAY",
            "assist": "Jamal Musiala"
          },
          {
            "minute": "39'",
            "type": "goal",
            "player": "Serhou Guirassy",
            "team": "BVB",
            "assist": "Julian Brandt"
          },
          {
            "minute": "55'",
            "type": "goal",
            "player": "Harry Kane (Pen)",
            "team": "BAY"
          },
          {
            "minute": "70'",
            "type": "goal",
            "player": "Michael Olise",
            "team": "BAY",
            "assist": "Alphonso Davies"
          }
        ],
        "stats": {
          "possession": {
            "home": "62%",
            "away": "38%"
          },
          "shotsOnTarget": {
            "home": 7,
            "away": 3
          },
          "corners": {
            "home": 8,
            "away": 2
          },
          "xG": {
            "home": 2.7,
            "away": 1.1
          }
        },
        "tacticalKey": "Vincent Kompany high pressing suffocating Dortmund buildup; Musiala half-space combination play."
      }
    ],
    "badminton": [
      {
        "id": "badm_live_allengland",
        "tournament": "All England Open Badminton Championships (Super 1000)",
        "venue": "Utilita Arena, Birmingham (Court 1)",
        "category": "Men's Singles — Semi-Final",
        "status": "LIVE - Game 3 Decider (18-17)",
        "isLive": true,
        "playerA": {
          "name": "Viktor Axelsen",
          "country": "DEN",
          "gameScores": [
            21,
            19,
            18
          ],
          "isServing": true
        },
        "playerB": {
          "name": "Anthony Sinisuka Ginting",
          "country": "INA",
          "gameScores": [
            16,
            21,
            17
          ],
          "isServing": false
        },
        "currentScore": "18 - 17 (Game 3)",
        "rallyCount": "34-shot rally underway",
        "fastestSmash": "428 km/h by Viktor Axelsen",
        "tacticalKey": "Axelsen working steep flat angles to prevent Ginting lightning net tumble and kill."
      },
      {
        "id": "badm_live_doubles",
        "tournament": "BWF World Tour Finals — Men's Doubles",
        "venue": "Hangzhou Olympic Sports Expo Center (Court 2)",
        "category": "Men's Doubles — Group Stage",
        "status": "LIVE - Game 2 (14-11)",
        "isLive": true,
        "playerA": {
          "name": "Satwiksairaj Rankireddy & Chirag Shetty",
          "country": "IND",
          "gameScores": [
            21,
            14
          ],
          "isServing": true
        },
        "playerB": {
          "name": "Liang Weikeng & Wang Chang",
          "country": "CHN",
          "gameScores": [
            18,
            11
          ],
          "isServing": false
        },
        "currentScore": "21-18, 14-11 (IND lead)",
        "rallyCount": "16-shot high speed drive duel",
        "fastestSmash": "502 km/h by Satwiksairaj Rankireddy",
        "tacticalKey": "Chirag interception speed at the T-junction cutting off Chinese counter-drives."
      }
    ]
  }
};

const defaultDashboardData = {
  "lastUpdated": "12:07:03 AM",
  "source": "Unified Real-Time Feeds: OpenCricket, API-Football & Badminton API Active",
  "hasLiveFeed": true,
  "upcomingFixtures": {
    "cricket": [
      {
        "id": "cric_fix_1",
        "match": "Border-Gavaskar Trophy — 5th Test (Series Decider)",
        "teams": "India vs Australia",
        "venue": "Sydney Cricket Ground (SCG), Australia",
        "date": "Nov 4, 2026",
        "time": "05:00 AM IST (23:30 GMT)",
        "format": "Test (5-Day Red Ball)",
        "tacticalKey": "Spin-friendly Day 4/5 SCG pitch. Ravichandran Ashwin & Ravindra Jadeja tandem vs Steve Smith technical chess match."
      },
      {
        "id": "cric_fix_2",
        "match": "ICC Champions Trophy — High Voltage Group Clash",
        "teams": "India vs Pakistan",
        "venue": "Dubai International Cricket Stadium, UAE",
        "date": "Nov 18, 2026",
        "time": "02:00 PM IST",
        "format": "ODI (50 Overs)",
        "tacticalKey": "Shaheen Shah Afridi opening inswinger vs Rohit Sharma front-foot pull. Middle-overs spin squeeze."
      },
      {
        "id": "cric_fix_3",
        "match": "England Tour of New Zealand — 1st Test Match",
        "teams": "England vs New Zealand",
        "venue": "Basin Reserve, Wellington",
        "date": "Nov 28, 2026",
        "time": "03:30 AM IST",
        "format": "Test (Bazball Approach)",
        "tacticalKey": "Gus Atkinson & Mark Wood seam barrage against Kane Williamson patient back-foot defense."
      }
    ],
    "football": [
      {
        "id": "foot_fix_ucl_1",
        "competition": "UEFA Champions League",
        "league": "UEFA Champions League — Semi-Final 1st Leg",
        "match": "Real Madrid vs Bayern Munich",
        "teams": "Real Madrid vs Bayern Munich",
        "venue": "Santiago Bernabéu, Madrid",
        "date": "Nov 3, 2026",
        "time": "20:00 BST (00:30 IST)",
        "tacticalKey": "High line vs rapid transition counters. Vinícius Jr. vs Alphonso Davies wide footrace."
      },
      {
        "id": "foot_fix_pl_1",
        "competition": "English Premier League",
        "league": "Premier League — The Manchester Derby",
        "match": "Manchester United vs Manchester City",
        "teams": "Manchester United vs Manchester City",
        "venue": "Old Trafford, Manchester",
        "date": "Nov 7, 2026",
        "time": "16:30 BST",
        "tacticalKey": "Pep Guardiola possession strangulation vs United fast break through wing channels."
      },
      {
        "id": "foot_fix_laliga_1",
        "competition": "Spanish LaLiga",
        "league": "LaLiga EA Sports — Madrid Derby",
        "match": "Atlético Madrid vs Real Madrid",
        "teams": "Atlético Madrid vs Real Madrid",
        "venue": "Cívitas Metropolitano, Madrid",
        "date": "Nov 12, 2026",
        "time": "20:00 CET",
        "tacticalKey": "Diego Simeone low mid-block 5-3-2 countering through Griezmann vs Ancelotti diamond midfield."
      },
      {
        "id": "foot_fix_bundes_1",
        "competition": "German Bundesliga",
        "league": "Bundesliga — Top-of-Table Clash",
        "match": "Bayer Leverkusen vs Bayern Munich",
        "teams": "Bayer Leverkusen vs Bayern Munich",
        "venue": "BayArena, Leverkusen",
        "date": "Nov 16, 2026",
        "time": "18:30 CET",
        "tacticalKey": "Xabi Alonso fluid 3-4-2-1 box midfield and inverted wing-backs testing Kompany defensive high-line."
      }
    ],
    "badminton": [
      {
        "id": "badm_fix_1",
        "match": "All England Open Badminton Championships (BWF Super 1000)",
        "teams": "Viktor Axelsen (DEN) vs Shi Yuqi (CHN)",
        "venue": "Utilita Arena, Birmingham, England",
        "date": "Nov 5, 2026",
        "time": "14:00 GMT",
        "format": "Men's Singles Championship",
        "tacticalKey": "Axelsen steep angled smash vs Shi Yuqi deceptive cross-court net tumble and wrist snap."
      },
      {
        "id": "badm_fix_2",
        "match": "Indonesia Open (BWF World Tour Super 1000)",
        "teams": "An Se-young (KOR) vs Akane Yamaguchi (JPN)",
        "venue": "Istora Senayan, Jakarta, Indonesia",
        "date": "Nov 19, 2026",
        "time": "12:00 Local",
        "format": "Women's Singles Clash",
        "tacticalKey": "An Se-young impenetrable four-corner retrieval defense vs Yamaguchi relentless footwork speed."
      },
      {
        "id": "badm_fix_3",
        "match": "BWF World Tour Finals — Men's Doubles",
        "teams": "Satwik / Chirag (IND) vs Liang / Wang (CHN)",
        "venue": "Hangzhou Olympic Sports Expo Center",
        "date": "Dec 2, 2026",
        "time": "18:00 Local",
        "format": "Men's Doubles Showdown",
        "tacticalKey": "Forecourt flat drives and service box domination deciding 3-shot rally winners."
      }
    ]
  },
  "recentResults": {
    "cricket": [
      {
        "match": "ICC Men's T20 World Cup 2024 Final",
        "date": "Kensington Oval, Barbados",
        "teams": "India (176/7) def. South Africa (169/8) by 7 runs",
        "winner": "India",
        "summary": "Virat Kohli masterclass 76 (59) anchored the innings; Hardik Pandya (3/20) and Jasprit Bumrah (2/18) defended 30 runs from the final 30 balls.",
        "mom": "Virat Kohli",
        "pom": "Jasprit Bumrah (Player of Tournament)"
      },
      {
        "match": "Border-Gavaskar Trophy — 1st Test at Perth",
        "date": "Optus Stadium, Perth",
        "teams": "India (150 & 487/6d) def. Australia (104 & 238) by 295 runs",
        "winner": "India",
        "summary": "Yashasvi Jaiswal majestic 161 and Virat Kohli sublime 100* demoralized the Australian pace attack; Bumrah claimed 8 wickets across the match.",
        "mom": "Jasprit Bumrah"
      },
      {
        "match": "ICC World Test Championship Final",
        "date": "The Oval, London",
        "teams": "Australia (469 & 270/8d) def. India (296 & 234) by 209 runs",
        "winner": "Australia",
        "summary": "Travis Head blistering 163 off 174 balls and Steve Smith 121 established first-innings domination.",
        "mom": "Travis Head"
      }
    ],
    "football": [
      {
        "match": "UEFA Champions League Final 2024",
        "teams": "Real Madrid 2 - 0 Borussia Dortmund",
        "winner": "Real Madrid",
        "summary": "Dani Carvajal header (74') and Vinícius Júnior angled finish (83') sealed Real Madrid's record-extending 15th European title at Wembley.",
        "venue": "Wembley Stadium, London"
      },
      {
        "match": "UEFA Euro 2024 Final",
        "teams": "Spain 2 - 1 England",
        "winner": "Spain",
        "summary": "Nico Williams opened the scoring before Mikel Oyarzabal tapped in the 86th-minute winner to crown Spain four-time European champions in Berlin.",
        "venue": "Olympiastadion, Berlin"
      },
      {
        "match": "Premier League Title Decider Matchday",
        "teams": "Manchester City 3 - 1 West Ham United",
        "winner": "Manchester City",
        "summary": "Phil Foden majestic brace secured Manchester City's historic fourth consecutive Premier League crown.",
        "venue": "Etihad Stadium, Manchester"
      }
    ],
    "badminton": [
      {
        "match": "Paris 2024 Olympic Men's Singles Final",
        "teams": "Viktor Axelsen (DEN) def. Kunlavut Vitidsarn (THA) 21-11, 21-11",
        "winner": "Viktor Axelsen (Gold Medalist)",
        "summary": "Axelsen joined legendary Lin Dan as only the second male shuttler in Olympic history to retain men's singles gold.",
        "venue": "Porte de La Chapelle Arena, Paris"
      },
      {
        "match": "Paris 2024 Olympic Women's Singles Final",
        "teams": "An Se-young (KOR) def. He Bingjiao (CHN) 21-13, 21-16",
        "winner": "An Se-young (Gold Medalist)",
        "summary": "World Number 1 An Se-young capped off a historic season with a clinical Olympic gold, cementing her dominance.",
        "venue": "Porte de La Chapelle Arena, Paris"
      },
      {
        "match": "BWF World Tour Finals Men's Doubles Championship",
        "teams": "Kang Min-hyuk & Seo Seung-jae (KOR) def. Liang Weikeng & Wang Chang (CHN) 21-17, 22-20",
        "winner": "Kang / Seo (World Champions)",
        "summary": "Thrilling two-game tactical masterclass with Korean defense turning steep smash pressure into counter-attack winners.",
        "venue": "Hangzhou, China"
      }
    ]
  },
  "rankings": {
    "cricket": {
      "source": "ICC Men's Official Team & Player Rankings",
      "lastUpdated": "Oct 31, 2026",
      "iccRankings": {
        "test": [
          {
            "rank": 1,
            "team": "Australia",
            "rating": 124,
            "points": 3714
          },
          {
            "rank": 2,
            "team": "India",
            "rating": 120,
            "points": 4078
          },
          {
            "rank": 3,
            "team": "England",
            "rating": 108,
            "points": 3995
          },
          {
            "rank": 4,
            "team": "South Africa",
            "rating": 104,
            "points": 2600
          }
        ],
        "odi": [
          {
            "rank": 1,
            "team": "India",
            "rating": 118,
            "points": 6490
          },
          {
            "rank": 2,
            "team": "Australia",
            "rating": 116,
            "points": 5218
          },
          {
            "rank": 3,
            "team": "South Africa",
            "rating": 112,
            "points": 3804
          },
          {
            "rank": 4,
            "team": "Pakistan",
            "rating": 106,
            "points": 3400
          }
        ],
        "t20i": [
          {
            "rank": 1,
            "team": "India",
            "rating": 268,
            "points": 18760
          },
          {
            "rank": 2,
            "team": "Australia",
            "rating": 256,
            "points": 12290
          },
          {
            "rank": 3,
            "team": "England",
            "rating": 253,
            "points": 10620
          },
          {
            "rank": 4,
            "team": "West Indies",
            "rating": 250,
            "points": 9980
          }
        ]
      },
      "playerRankings": {
        "testBatters": [
          "Joe Root (ENG)",
          "Kane Williamson (NZ)",
          "Harry Brook (ENG)",
          "Yashasvi Jaiswal (IND)",
          "Steve Smith (AUS)"
        ],
        "odiBatters": [
          "Babar Azam (PAK)",
          "Rohit Sharma (IND)",
          "Shubman Gill (IND)",
          "Virat Kohli (IND)",
          "Daryl Mitchell (NZ)"
        ],
        "t20Bowlers": [
          "Adil Rashid (ENG)",
          "Akeal Hosein (WI)",
          "Wanindu Hasaranga (SL)",
          "Jasprit Bumrah (IND)",
          "Rashid Khan (AFG)"
        ]
      },
      "recentTournament": "ICC Men's T20 World Cup Champion: India (Unbeaten 8-0 tournament record)"
    },
    "football": {
      "fifaRankings": [
        {
          "rank": 1,
          "team": "Argentina",
          "points": 1883.5
        },
        {
          "rank": 2,
          "team": "France",
          "points": 1853.1
        },
        {
          "rank": 3,
          "team": "Spain",
          "points": 1844.3
        },
        {
          "rank": 4,
          "team": "England",
          "points": 1807.8
        },
        {
          "rank": 5,
          "team": "Brazil",
          "points": 1784.3
        }
      ],
      "eplStandings": [
        {
          "rank": 1,
          "team": "Liverpool",
          "played": 28,
          "won": 20,
          "drawn": 7,
          "lost": 1,
          "gd": 42,
          "points": 67,
          "form": "W-W-D-W-W"
        },
        {
          "rank": 2,
          "team": "Arsenal",
          "played": 28,
          "won": 18,
          "drawn": 7,
          "lost": 3,
          "gd": 36,
          "points": 61,
          "form": "W-D-W-W-D"
        },
        {
          "rank": 3,
          "team": "Manchester City",
          "played": 28,
          "won": 16,
          "drawn": 6,
          "lost": 6,
          "gd": 28,
          "points": 54,
          "form": "L-W-W-D-W"
        },
        {
          "rank": 4,
          "team": "Chelsea",
          "played": 28,
          "won": 15,
          "drawn": 7,
          "lost": 6,
          "gd": 21,
          "points": 52,
          "form": "W-W-L-D-W"
        },
        {
          "rank": 5,
          "team": "Newcastle United",
          "played": 28,
          "won": 14,
          "drawn": 5,
          "lost": 9,
          "gd": 14,
          "points": 47,
          "form": "D-W-W-L-W"
        }
      ],
      "uclChampion": "Real Madrid (Record 15-time European Champions)",
      "premierLeagueLeader": "Liverpool / Arsenal / Manchester City Title Race",
      "ballonDor2024": "Rodri (Manchester City & Spain — Euro 2024 & Premier League Champion)"
    },
    "badminton": {
      "source": "Official BWF World Rankings (bwfworldtour.bwfbadminton.com)",
      "lastUpdated": "Oct 31, 2026",
      "bwfRankings": {
        "mensSingles": [
          {
            "rank": 1,
            "player": "Shi Yuqi",
            "country": "CHN",
            "points": 101815
          },
          {
            "rank": 2,
            "player": "Viktor Axelsen",
            "country": "DEN",
            "points": 96730
          },
          {
            "rank": 3,
            "player": "Anders Antonsen",
            "country": "DEN",
            "points": 87141
          },
          {
            "rank": 4,
            "player": "Kodai Naraoka",
            "country": "JPN",
            "points": 83525
          },
          {
            "rank": 5,
            "player": "Jonatan Christie",
            "country": "INA",
            "points": 82117
          },
          {
            "rank": 15,
            "player": "Lakshya Sen",
            "country": "IND",
            "points": 64140
          }
        ],
        "womensSingles": [
          {
            "rank": 1,
            "player": "An Se-young",
            "country": "KOR",
            "points": 113314
          },
          {
            "rank": 2,
            "player": "Wang Zhiyi",
            "country": "CHN",
            "points": 94645
          },
          {
            "rank": 3,
            "player": "Han Yue",
            "country": "CHN",
            "points": 88109
          },
          {
            "rank": 4,
            "player": "Akane Yamaguchi",
            "country": "JPN",
            "points": 86450
          },
          {
            "rank": 5,
            "player": "Tai Tzu-ying",
            "country": "TPE",
            "points": 82222
          },
          {
            "rank": 18,
            "player": "PV Sindhu",
            "country": "IND",
            "points": 53120
          }
        ],
        "mensDoubles": [
          {
            "rank": 1,
            "pair": "Goh Sze Fei & Nur Izzuddin",
            "country": "MAS",
            "points": 88200
          },
          {
            "rank": 2,
            "pair": "Kim Astrup & Anders Skaarup Rasmussen",
            "country": "DEN",
            "points": 86703
          },
          {
            "rank": 3,
            "pair": "Satwiksairaj Rankireddy & Chirag Shetty",
            "country": "IND",
            "points": 85250
          },
          {
            "rank": 4,
            "pair": "Liang Weikeng & Wang Chang",
            "country": "CHN",
            "points": 84600
          }
        ],
        "womensDoubles": [
          {
            "rank": 1,
            "pair": "Liu Shengshu & Tan Ning",
            "country": "CHN",
            "points": 101246
          },
          {
            "rank": 2,
            "pair": "Baek Ha-na & Lee So-hee",
            "country": "KOR",
            "points": 98110
          },
          {
            "rank": 3,
            "pair": "Nami Matsuyama & Chiharu Shida",
            "country": "JPN",
            "points": 89455
          }
        ],
        "mixedDoubles": [
          {
            "rank": 1,
            "pair": "Zheng Siwei & Huang Yaqiong",
            "country": "CHN",
            "points": 108500
          },
          {
            "rank": 2,
            "pair": "Feng Yanzhe & Huang Dongping",
            "country": "CHN",
            "points": 96300
          },
          {
            "rank": 3,
            "pair": "Yuta Watanabe & Arisa Higashino",
            "country": "JPN",
            "points": 88120
          }
        ]
      },
      "olympicChampions": "Paris 2024 Gold: Viktor Axelsen (DEN), An Se-young (KOR), Lee/Wang (TPE)"
    }
  }
};

const defaultPlayerMatrix = {
  "sports": {
    "cricket": {
      "metrics": [
        "Technical Mastery",
        "Clutch Impact",
        "Strike Rate / Power",
        "Consistency",
        "Versatility",
        "Longevity"
      ],
      "players": {
        "virat_kohli": {
          "id": "virat_kohli",
          "name": "Virat Kohli",
          "country": "India",
          "flag": "🇮🇳",
          "role": "Right-Handed Top-Order Batter",
          "matches": 535,
          "runs": "26,900+",
          "centuries": 80,
          "avg": 53.8,
          "strikeRate": 93.5,
          "radar": [
            96,
            99,
            88,
            98,
            92,
            95
          ],
          "badges": [
            "80 International 100s",
            "ICC Player of the Decade",
            "Most Runs in Single World Cup (765)"
          ],
          "bio": "The premier chasing maestro of modern cricket, renowned for supreme fitness, fierce drive mechanics, and masterclass strike-rotation."
        },
        "sachin_tendulkar": {
          "id": "sachin_tendulkar",
          "name": "Sachin Tendulkar",
          "country": "India",
          "flag": "🇮🇳",
          "role": "Right-Handed Opening / Top-Order Batter",
          "matches": 664,
          "runs": "34,357",
          "centuries": 100,
          "avg": 48.5,
          "strikeRate": 86.2,
          "radar": [
            100,
            96,
            91,
            97,
            95,
            100
          ],
          "badges": [
            "100 International 100s",
            "2011 CWC Champion",
            "Most International Runs & Centuries in History"
          ],
          "bio": "The undisputed batting benchmark. Flawless balance, unmatched repertoire of strokes, and sustained dominance against all generations of pace and spin."
        },
        "babar_azam": {
          "id": "babar_azam",
          "name": "Babar Azam",
          "country": "Pakistan",
          "flag": "🇵🇰",
          "role": "Right-Handed Top-Order Batter",
          "matches": 290,
          "runs": "13,500+",
          "centuries": 31,
          "halfCenturies": 92,
          "wickets": 0,
          "battingAverage": 54.2,
          "strikeRate": 88.7,
          "radar": [
            94,
            82,
            80,
            92,
            85,
            84
          ],
          "badges": [
            "Former #1 ODI Batter",
            "Fastest to 5,000 ODI Runs",
            "Iconic Cover Drive"
          ],
          "strengths": [
            "Pristine off-drive execution",
            "High batting average against spin",
            "Anchor role stability"
          ],
          "weaknesses": [
            "Vulnerability to incoming inswingers in early overs",
            "Middle-overs strike rate acceleration"
          ],
          "bio": "A classical, aesthetic stroke-maker blessed with head stillness and pristine timing, anchoring modern Pakistani top-orders."
        },
        "rohit_sharma": {
          "id": "rohit_sharma",
          "name": "Rohit Sharma",
          "country": "India",
          "flag": "🇮🇳",
          "role": "Right-Handed Opening Batter (Hitman)",
          "matches": 485,
          "runs": "19,200+",
          "centuries": 48,
          "halfCenturies": 104,
          "wickets": 12,
          "battingAverage": 49.1,
          "strikeRate": 91.8,
          "radar": [
            96,
            95,
            99,
            90,
            88,
            92
          ],
          "badges": [
            "3x ODI Double Centuries (Record 264)",
            "Most Sixes in International Cricket",
            "2024 T20 CWC Captain"
          ],
          "strengths": [
            "Unmatched pull-shot authority",
            "Powerplay six-hitting aggression",
            "High double-hundred ceiling"
          ],
          "weaknesses": [
            "Early left-arm pace inswing delivery angle"
          ],
          "bio": "The Hitman of world cricket. Possesses an extra second of visual reaction time against express pace, holding the all-time ODI individual score record of 264."
        },
        "ms_dhoni": {
          "id": "ms_dhoni",
          "name": "MS Dhoni",
          "country": "India",
          "flag": "🇮🇳",
          "role": "Right-Handed Wicketkeeper-Finisher / Captain",
          "matches": 538,
          "runs": "17,266",
          "centuries": 16,
          "halfCenturies": 108,
          "wickets": 1,
          "battingAverage": 50.6,
          "strikeRate": 87.6,
          "radar": [
            92,
            100,
            94,
            95,
            96,
            97
          ],
          "badges": [
            "Only Captain to Win All 3 ICC White-Ball Trophies (T20, CWC, CT)",
            "Fastest Stumping in History (0.08s)",
            "Finishing Mastermind"
          ],
          "strengths": [
            "Helicopter shot execution",
            "High-pressure chase psychological composure",
            "Lightning-fast stumping hand speed"
          ],
          "weaknesses": [
            "Dot-ball build-up in early innings progression"
          ],
          "bio": "Captain Cool. The definitive master of modern white-ball run-chase mathematics, renowned for ice-vein composure, helicopter shot power, and unmatched glove-work."
        },
        "rishabh_pant": {
          "id": "rishabh_pant",
          "name": "Rishabh Pant",
          "country": "India",
          "flag": "🇮🇳",
          "role": "Left-Handed Wicketkeeper-Batter",
          "matches": 145,
          "runs": "5,100+",
          "centuries": 8,
          "halfCenturies": 26,
          "wickets": 0,
          "battingAverage": 43.8,
          "strikeRate": 88.5,
          "radar": [
            88,
            96,
            96,
            85,
            84,
            82
          ],
          "badges": [
            "Gabba 2021 Historic Hero (89*)",
            "Test Centuries in England, Australia, South Africa",
            "Fearless Counter-Attacker"
          ],
          "strengths": [
            "Unorthodox ramp and scoop strokes",
            "Destructive assault against premier spin",
            "Game-changing match-winner"
          ],
          "weaknesses": [
            "Occasional rash stroke selection outside off-stump"
          ],
          "bio": "A box-office maverick wicketkeeper-batter. Counter-attacking dynamo who dismantled Australia at the Gabba and rewrote modern Test wicketkeeping aggression."
        },
        "jasprit_bumrah": {
          "id": "jasprit_bumrah",
          "name": "Jasprit Bumrah",
          "country": "India",
          "flag": "🇮🇳",
          "role": "Right-Arm Fast Bowler (Apex Predator)",
          "matches": 195,
          "runs": "650+",
          "centuries": 0,
          "halfCenturies": 0,
          "wickets": 405,
          "battingAverage": 9.8,
          "strikeRate": 145,
          "bowlingAverage": 20.4,
          "economy": 4.45,
          "radar": [
            100,
            100,
            95,
            99,
            90,
            93
          ],
          "badges": [
            "ICC T20 CWC 2024 Player of the Tournament (Econ 4.17)",
            "All-Format Number 1 Bowler",
            "Unplayable Hyperextension Yorker"
          ],
          "strengths": [
            "Lethal dipping yorkers",
            "Searing reverse swing",
            "Hyperextension release deception"
          ],
          "weaknesses": [
            "Heavy workload injury management"
          ],
          "bio": "The undisputed premier fast bowler across all formats. Armed with a unique slingshot action, hyperextended arm, and pinpoint dipping yorkers at 145 km/h."
        },
        "shaheen_afridi": {
          "id": "shaheen_afridi",
          "name": "Shaheen Shah Afridi",
          "country": "Pakistan",
          "flag": "🇵🇰",
          "role": "Left-Arm Fast Bowler",
          "matches": 160,
          "runs": "480+",
          "centuries": 0,
          "halfCenturies": 0,
          "wickets": 320,
          "battingAverage": 8.5,
          "strikeRate": 130,
          "bowlingAverage": 23.8,
          "economy": 5.1,
          "radar": [
            94,
            90,
            88,
            92,
            86,
            85
          ],
          "badges": [
            "Sir Garfield Sobers Trophy Winner",
            "First-Over Wicket Specialist",
            "Curling 145 km/h Inswinger"
          ],
          "strengths": [
            "Devastating first-over new-ball inswing to right-handers",
            "High release point trajectory"
          ],
          "weaknesses": [
            "Pace drop and wrist position variability in long Test spells"
          ],
          "bio": "A tall 6ft 6in left-arm thunderbolt who terrorizes top orders worldwide with unplayable first-over inswingers pitched on the leg stump."
        },
        "steve_smith": {
          "id": "steve_smith",
          "name": "Steve Smith",
          "country": "Australia",
          "flag": "🇦🇺",
          "role": "Right-Handed Test Specialist Batter",
          "matches": 320,
          "runs": "16,000+",
          "centuries": 44,
          "avg": 57,
          "strikeRate": 72.4,
          "radar": [
            98,
            95,
            78,
            97,
            88,
            93
          ],
          "badges": [
            "Test Avg 57.0",
            "2x Ashes Player of the Series",
            "2x CWC Champion"
          ],
          "bio": "Unconventional shuffle technique with unparalleled hand-eye coordination and spatial awareness; Bradman-esque Test batting consistency."
        }
      },
      "presets": [
        {
          "id": "kohli_vs_sachin",
          "player1": "virat_kohli",
          "player2": "sachin_tendulkar",
          "label": "Virat Kohli vs Sachin Tendulkar (The GOAT Batting Debate)"
        },
        {
          "id": "kohli_vs_babar",
          "player1": "virat_kohli",
          "player2": "babar_azam",
          "label": "Virat Kohli vs Babar Azam (Subcontinent Showdown)"
        },
        {
          "id": "kohli_vs_smith",
          "player1": "virat_kohli",
          "player2": "steve_smith",
          "label": "Virat Kohli vs Steve Smith (Modern Fab 4 Rivalry)"
        }
      ],
      "headToHead": {
        "virat_kohli_vs_babar_azam": {
          "odiAvg": "58.2 vs 56.7",
          "iccTrophyKnockouts": "Kohli 6 MoM vs Babar 1 MoM",
          "chaseAvg": "Kohli 65.4 vs Babar 51.2",
          "verdict": "Kohli holds a clear edge in chase pressure, ICC tournament knockout impact, and career longevity."
        },
        "virat_kohli_vs_sachin_tendulkar": {
          "runsPerInnings": "Kohli 49.8 vs Sachin 47.2",
          "odiCenturies": "Kohli 50 vs Sachin 49",
          "testDominance": "Sachin (51 100s, avg 53.8) holds Test edge; Kohli holds ODI chase edge."
        }
      }
    },
    "football": {
      "metrics": [
        "Finishing (xG)",
        "Playmaking / Vision",
        "Dribbling / 1v1",
        "Acceleration / Pace",
        "Defensive Work Rate",
        "Clutch / Big Match"
      ],
      "players": {
        "lionel_messi": {
          "id": "lionel_messi",
          "name": "Lionel Messi",
          "country": "Argentina",
          "flag": "🇦🇷",
          "role": "Right Winger / False 9 / Playmaker",
          "matches": 1080,
          "goals": 840,
          "assists": 380,
          "trophies": 44,
          "radar": [
            99,
            100,
            100,
            92,
            60,
            99
          ],
          "badges": [
            "8x Ballon d'Or",
            "2022 FIFA World Cup Champion",
            "4x UEFA Champions League"
          ],
          "bio": "The complete attacking genius. Low center of gravity, transcendent vision, pinpoint finishing, and unmatched career playmaking metrics."
        },
        "cristiano_ronaldo": {
          "id": "cristiano_ronaldo",
          "name": "Cristiano Ronaldo",
          "country": "Portugal",
          "flag": "🇵🇹",
          "role": "Left Winger / Center Forward (Poacher)",
          "matches": 1220,
          "goals": 900,
          "assists": 255,
          "trophies": 34,
          "radar": [
            100,
            82,
            88,
            95,
            65,
            100
          ],
          "badges": [
            "5x Ballon d'Or",
            "5x UEFA Champions League",
            "All-Time Leading Goalscorer in Football History"
          ],
          "bio": "The supreme athletic goal-machine. Lethal aerial heading, explosive off-ball movement, ruthless two-footed finishing, and clutch UCL knockout pedigree."
        },
        "erling_haaland": {
          "id": "erling_haaland",
          "name": "Erling Haaland",
          "country": "Norway",
          "flag": "🇳🇴",
          "role": "Pure Center Forward (Striker)",
          "matches": 330,
          "goals": 270,
          "assists": 50,
          "trophies": 10,
          "radar": [
            99,
            68,
            74,
            96,
            70,
            92
          ],
          "badges": [
            "Premier League Single-Season Record (36 Goals)",
            "European Golden Shoe",
            "UCL Treble Winner"
          ],
          "bio": "A freak of nature inside the penalty box. Overwhelming physical velocity, elite box anticipation, and historic goal-per-game ratios."
        },
        "kylian_mbappe": {
          "id": "kylian_mbappe",
          "name": "Kylian Mbappé",
          "country": "France",
          "flag": "🇫🇷",
          "role": "Left Winger / Inside Forward",
          "matches": 440,
          "goals": 330,
          "assists": 140,
          "trophies": 18,
          "radar": [
            96,
            85,
            94,
            100,
            62,
            97
          ],
          "badges": [
            "2018 World Cup Champion",
            "2022 World Cup Final Hat-trick",
            "PSG All-Time Top Scorer"
          ],
          "bio": "Terrifying transition velocity, clinical angled finishes, and historic World Cup final scoring heroism."
        },
        "kevin_de_bruyne": {
          "id": "kevin_de_bruyne",
          "name": "Kevin De Bruyne",
          "country": "Belgium",
          "flag": "🇧🇪",
          "role": "Attacking Midfielder (Playmaker)",
          "matches": 615,
          "goals": 152,
          "assists": 260,
          "goalsPerMatch": 0.25,
          "shots": 1100,
          "passingAccuracy": "84.8%",
          "appearances": 615,
          "playingPosition": "CAM / Central Midfield",
          "trophies": 19,
          "radar": [
            90,
            100,
            88,
            82,
            74,
            95
          ],
          "badges": [
            "Premier League Playmaker of the Season (Record 3x)",
            "UCL Treble Champion",
            "Master of the Whipped Cross"
          ],
          "strengths": [
            "Lethal low-driven whipped cross behind defenders",
            "Elite progressive passing vision",
            "Long-range rocket shots"
          ],
          "weaknesses": [
            "Vulnerability to recurring hamstring muscle injuries"
          ],
          "bio": "The quintessential modern visionary playmaker. Capable of bending ball physics with surgical precision passes, carving open world-class low blocks."
        },
        "luka_modric": {
          "id": "luka_modric",
          "name": "Luka Modrić",
          "country": "Croatia",
          "flag": "🇭🇷",
          "role": "Central Midfielder (Maestro / Trivela Specialist)",
          "matches": 840,
          "goals": 90,
          "assists": 155,
          "goalsPerMatch": 0.11,
          "shots": 720,
          "passingAccuracy": "91.2%",
          "appearances": 840,
          "playingPosition": "CM / Deep Playmaker",
          "trophies": 30,
          "radar": [
            84,
            98,
            92,
            80,
            85,
            98
          ],
          "badges": [
            "2018 Ballon d'Or Winner",
            "6x UEFA Champions League Champion",
            "Iconic Trivela Outside-Foot Pass"
          ],
          "strengths": [
            "Effortless press evasion in half-spaces",
            "Outside-of-the-boot Trivela curve",
            "Elite match-tempo orchestration"
          ],
          "weaknesses": [
            "Physical aerial aerial duels"
          ],
          "bio": "The timeless Croatian maestro. Possesses superhuman spatial awareness, relentless stamina, and the most iconic outside-of-the-boot Trivela pass in football lore."
        }
      },
      "presets": [
        {
          "id": "messi_vs_ronaldo",
          "player1": "lionel_messi",
          "player2": "cristiano_ronaldo",
          "label": "Lionel Messi vs Cristiano Ronaldo (The Modern GOAT Clash)"
        },
        {
          "id": "haaland_vs_mbappe",
          "player1": "erling_haaland",
          "player2": "kylian_mbappe",
          "label": "Erling Haaland vs Kylian Mbappé (The Next Era)"
        },
        {
          "id": "debruyne_vs_modric",
          "player1": "kevin_de_bruyne",
          "player2": "luka_modric",
          "label": "Kevin De Bruyne vs Luka Modrić (Midfield Maestros)"
        }
      ],
      "headToHead": {
        "lionel_messi_vs_cristiano_ronaldo": {
          "headToHeadMatches": "36 Direct Clashes: Messi 16 Wins, Ronaldo 11 Wins, 9 Draws",
          "goalsInElClasico": "Messi 26 vs Ronaldo 18",
          "ballonDor": "Messi 8 vs Ronaldo 5",
          "uclTitles": "Messi 4 vs Ronaldo 5",
          "verdict": "Messi dominates all-round playmaking, assists, and direct El Clásico head-to-heads; Ronaldo holds edge in pure UCL knockout goals and aerial athleticism."
        },
        "kevin_de_bruyne_vs_luka_modric": {
          "headToHeadMatches": "8 Direct Clashes across UCL & Internationals",
          "passAccuracy": "Modric 91.2% vs De Bruyne 84.8%",
          "keyPasses": "De Bruyne 3.4/90 vs Modric 2.1/90",
          "verdict": "Modric dictates tempo and ball retention under high pressure; De Bruyne excels in final-third chance creation and lethal delivery."
        }
      }
    },
    "badminton": {
      "metrics": [
        "Smash Velocity",
        "Net Precision",
        "Court Stamina",
        "Defensive Resilience",
        "Tactical Deception",
        "Mental Toughness"
      ],
      "players": {
        "lin_dan": {
          "id": "lin_dan",
          "name": "Lin Dan",
          "country": "China",
          "flag": "🇨🇳",
          "role": "Left-Handed Men's Singles Legend",
          "matches": 790,
          "titles": 66,
          "worldRanking": "Former World #1",
          "careerTitles": 66,
          "matchesPlayed": 790,
          "wins": 666,
          "losses": 124,
          "winPercentage": "84.3%",
          "olympics": "2x Gold (2008, 2012)",
          "worldChamps": "5x World Champion",
          "radar": [
            98,
            99,
            97,
            100,
            99,
            100
          ],
          "badges": [
            "Super Grand Slam (All 9 Major Titles)",
            "2x Olympic Gold",
            "5x World Champion"
          ],
          "strengths": [
            "Explosive left-handed around-the-head smash",
            "Unpenetrable defensive court coverage",
            "Unmatched big-match clutchness"
          ],
          "weaknesses": [
            "Pacing through preliminary tour rounds"
          ],
          "bio": "Super Dan — the greatest big-game predator in badminton history. Sudden explosive left-handed smashes, impregnable defense, and tactical mastery."
        },
        "lee_chong_wei": {
          "id": "lee_chong_wei",
          "name": "Lee Chong Wei",
          "country": "Malaysia",
          "flag": "🇲🇾",
          "role": "Right-Handed Men's Singles Icon",
          "matches": 850,
          "titles": 69,
          "worldRanking": "Former World #1 (349 Weeks)",
          "careerTitles": 69,
          "matchesPlayed": 850,
          "wins": 713,
          "losses": 137,
          "winPercentage": "83.9%",
          "olympics": "3x Silver (2008, 2012, 2016)",
          "worldChamps": "3x World Silver",
          "radar": [
            96,
            97,
            100,
            96,
            96,
            92
          ],
          "badges": [
            "349 Consecutive Weeks at World #1",
            "47 BWF Super Series Titles",
            "3x Olympic Medalist"
          ],
          "strengths": [
            "Fastest footwork recovery speed in history",
            "Steep baseline cross-court jump smash",
            "Relentless baseline-to-net speed"
          ],
          "weaknesses": [
            "High-stress Olympic gold medal match deciders"
          ],
          "bio": "Unrivaled footwork agility, lightning fast recovery, and blistering jump-smash speed that ruled the BWF tour for an entire decade."
        },
        "viktor_axelsen": {
          "id": "viktor_axelsen",
          "name": "Viktor Axelsen",
          "country": "Denmark",
          "flag": "🇩🇰",
          "role": "Right-Handed Men's Singles Dominator",
          "matches": 620,
          "titles": 36,
          "worldRanking": "Current World #2 (Former #1)",
          "careerTitles": 36,
          "matchesPlayed": 620,
          "wins": 512,
          "losses": 108,
          "winPercentage": "82.6%",
          "olympics": "2x Gold (Tokyo 2020, Paris 2024)",
          "worldChamps": "2x World Champion",
          "radar": [
            100,
            92,
            95,
            95,
            90,
            98
          ],
          "badges": [
            "Back-to-Back Olympic Champion (Tokyo 2020 & Paris 2024)",
            "Steepest Smash Angles on Tour"
          ],
          "strengths": [
            "1.94m height advantage creating steep downward smash trajectory",
            "Baseline wingspan reach",
            "Physical dominance in three-game encounters"
          ],
          "weaknesses": [
            "Low-skimming flat net exchanges from agile opponents"
          ],
          "bio": "The towering 1.94m Danish powerhouse. Imposing steep downward smash angles, commanding baseline reach, and calm championship composure."
        },
        "pv_sindhu": {
          "id": "pv_sindhu",
          "name": "PV Sindhu",
          "country": "India",
          "flag": "🇮🇳",
          "role": "Right-Handed Women's Singles Icon",
          "matches": 580,
          "titles": 18,
          "worldRanking": "World #18 (Former World #2)",
          "careerTitles": 18,
          "matchesPlayed": 580,
          "wins": 425,
          "losses": 155,
          "winPercentage": "73.3%",
          "olympics": "Silver (Rio 2016), Bronze (Tokyo 2020)",
          "worldChamps": "World Champion (2019 Gold, 5 World Medals)",
          "radar": [
            98,
            88,
            94,
            92,
            85,
            96
          ],
          "badges": [
            "2x Olympic Medalist (First Indian Woman)",
            "2019 BWF World Champion (Gold)",
            "374 km/h Searing Smash"
          ],
          "strengths": [
            "1.79m towering height delivering heavy steep smashes",
            "Relentless rally endurance",
            "Aggressive baseline attack"
          ],
          "weaknesses": [
            "Deceptive net spins and hairpin exchanges"
          ],
          "bio": "India's champion shuttler. A fierce baseline predator with towering reach and devastating overhead smashes, holding two consecutive Olympic medals."
        },
        "carolina_marin": {
          "id": "carolina_marin",
          "name": "Carolina Marín",
          "country": "Spain",
          "flag": "🇪🇸",
          "role": "Left-Handed Women's Singles Dynamo",
          "matches": 610,
          "titles": 38,
          "worldRanking": "World #5 (Former World #1)",
          "careerTitles": 38,
          "matchesPlayed": 610,
          "wins": 472,
          "losses": 138,
          "winPercentage": "77.4%",
          "olympics": "Gold (Rio 2016)",
          "worldChamps": "3x World Champion (2014, 2015, 2018)",
          "radar": [
            96,
            94,
            96,
            90,
            92,
            99
          ],
          "badges": [
            "2016 Olympic Gold Medalist",
            "3x World Champion (Record in Women's Singles)",
            "7x European Champion"
          ],
          "strengths": [
            "Relentless high-octane speed & psychological ferocity",
            "Left-handed angled cross-court slices",
            "Dominating front-court kill transitions"
          ],
          "weaknesses": [
            "Severe knee ligament injury rehabilitation management"
          ],
          "bio": "The Spanish conqueror. Revolutionized European badminton with unprecedented left-handed aggressive pace, vocal intensity, and 3 World Championship crowns."
        }
      },
      "presets": [
        {
          "id": "lin_vs_lee",
          "player1": "lin_dan",
          "player2": "lee_chong_wei",
          "label": "Lin Dan vs Lee Chong Wei (Greatest Badminton Rivalry)"
        },
        {
          "id": "lin_vs_axelsen",
          "player1": "lin_dan",
          "player2": "viktor_axelsen",
          "label": "Lin Dan vs Viktor Axelsen (Generational Olympic Champions)"
        },
        {
          "id": "sindhu_vs_marin",
          "player1": "pv_sindhu",
          "player2": "carolina_marin",
          "label": "PV Sindhu vs Carolina Marín (Rio 2016 Final Rematch)"
        }
      ],
      "headToHead": {
        "lin_dan_vs_lee_chong_wei": {
          "headToHeadRecord": "40 Direct Encounters: Lin Dan 28 Wins, Lee Chong Wei 12 Wins",
          "olympicFinals": "2008 Beijing (Lin won), 2012 London (Lin won 21-19 in decider)",
          "verdict": "Lee Chong Wei maintained unmatched tour consistency with 349 weeks at #1, but Lin Dan proved near unbeatable in major Olympic and World Championship finals."
        },
        "pv_sindhu_vs_carolina_marin": {
          "headToHeadRecord": "17 Direct Clashes: Marin 11 Wins, Sindhu 6 Wins",
          "epicEncounters": "2016 Rio Olympic Final (Marin 19-21, 21-12, 21-15), 2018 World Championship Final (Marin won)",
          "verdict": "Sindhu holds the power advantage with the steeper smash; Marin dominates speed, pace changes, and psychological intimidation."
        }
      }
    }
  }
};
