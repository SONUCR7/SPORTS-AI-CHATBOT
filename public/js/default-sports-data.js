const defaultLiveMatches = {
  "lastUpdated": "11:43:44 PM",
  "sourceStatus": {
    "football": {
      "provider": "Opta / UEFA Verified Feed (Standby)",
      "isLive": false,
      "configured": false,
      "competitions": [
        "Premier League",
        "UEFA Champions League",
        "La Liga",
        "Bundesliga"
      ]
    },
    "cricket": {
      "provider": "ICC / BCCI Verified Feed (Standby)",
      "isLive": false,
      "configured": false
    },
    "badminton": {
      "provider": "BWF World Tour Verified Feed (Standby)",
      "isLive": false,
      "configured": false
    }
  },
  "matches": {
    "cricket": [
      {
        "id": "cric_1",
        "series": "Border-Gavaskar Trophy (ICC World Test Championship)",
        "venue": "Melbourne Cricket Ground, Australia",
        "status": "LIVE — Day 3, Session 2",
        "teamA": {
          "name": "India",
          "code": "IND",
          "flag": "🇮🇳",
          "score": "368 & 184/3",
          "overs": "54.2"
        },
        "teamB": {
          "name": "Australia",
          "code": "AUS",
          "flag": "🇦🇺",
          "score": "320",
          "overs": "92.4"
        },
        "situation": "India lead by 232 runs with 7 wickets remaining",
        "activeBatters": [
          {
            "name": "Virat Kohli",
            "runs": 78,
            "balls": 118,
            "fours": 8,
            "sixes": 1,
            "sr": 66.1
          },
          {
            "name": "Rishabh Pant",
            "runs": 42,
            "balls": 46,
            "fours": 5,
            "sixes": 2,
            "sr": 91.3
          }
        ],
        "activeBowlers": [
          {
            "name": "Pat Cummins",
            "overs": "14.2",
            "maidens": 3,
            "runs": 44,
            "wickets": 2,
            "econ": 3.07
          },
          {
            "name": "Nathan Lyon",
            "overs": "18.0",
            "maidens": 2,
            "runs": 62,
            "wickets": 1,
            "econ": 3.44
          }
        ],
        "recentBalls": [
          "•",
          "1",
          "4",
          "•",
          "W",
          "2",
          "|",
          "1",
          "6",
          "•"
        ],
        "winProbability": {
          "teamA": 68,
          "teamB": 24,
          "draw": 8
        }
      },
      {
        "id": "cric_2",
        "series": "Indian Premier League (IPL)",
        "venue": "Wankhede Stadium, Mumbai",
        "status": "INNINGS BREAK — Target: 198",
        "teamA": {
          "name": "Mumbai Indians",
          "code": "MI",
          "flag": "🔵",
          "score": "197/5",
          "overs": "20.0"
        },
        "teamB": {
          "name": "Chennai Super Kings",
          "code": "CSK",
          "flag": "🟡",
          "score": "Yet to bat",
          "overs": "0.0"
        },
        "situation": "CSK require 198 runs at 9.90 RPO to win",
        "activeBatters": [
          {
            "name": "Suryakumar Yadav",
            "runs": 68,
            "balls": 34,
            "fours": 6,
            "sixes": 4,
            "sr": 200
          },
          {
            "name": "Hardik Pandya",
            "runs": 28,
            "balls": 14,
            "fours": 2,
            "sixes": 2,
            "sr": 200
          }
        ],
        "activeBowlers": [
          {
            "name": "Matheesha Pathirana",
            "overs": "4.0",
            "maidens": 0,
            "runs": 32,
            "wickets": 2,
            "econ": 8
          }
        ],
        "recentBalls": [
          "1",
          "4",
          "6",
          "2",
          "W",
          "4"
        ],
        "winProbability": {
          "teamA": 54,
          "teamB": 46
        }
      }
    ],
    "football": [
      {
        "id": "foot_1",
        "league": "UEFA Champions League — Quarter-Final 2nd Leg",
        "venue": "Etihad Stadium, Manchester",
        "status": "LIVE — 78' Minute",
        "teamA": {
          "name": "Manchester City",
          "code": "MCI",
          "flag": "🔵",
          "score": 2
        },
        "teamB": {
          "name": "Real Madrid",
          "code": "RMA",
          "flag": "⚪",
          "score": 1
        },
        "aggregate": "Agg: 5 - 4 (MCI leading)",
        "events": [
          {
            "min": "24'",
            "type": "goal",
            "player": "Erling Haaland",
            "detail": "Assist: Kevin De Bruyne"
          },
          {
            "min": "41'",
            "type": "goal",
            "player": "Vinicius Jr.",
            "detail": "Assist: Jude Bellingham"
          },
          {
            "min": "56'",
            "type": "card",
            "player": "Dani Carvajal",
            "detail": "Yellow Card (Tactical Foul)"
          },
          {
            "min": "69'",
            "type": "goal",
            "player": "Phil Foden",
            "detail": "Curler outside box into top corner"
          }
        ],
        "stats": {
          "possession": [
            58,
            42
          ],
          "xG": [
            "2.14",
            "1.38"
          ],
          "shots": [
            15,
            9
          ],
          "shotsOnTarget": [
            7,
            4
          ],
          "corners": [
            8,
            3
          ],
          "fouls": [
            9,
            14
          ]
        }
      },
      {
        "id": "foot_2",
        "league": "La Liga EA Sports — El Clásico",
        "venue": "Santiago Bernabéu, Madrid",
        "status": "FULL TIME",
        "teamA": {
          "name": "Real Madrid",
          "code": "RMA",
          "flag": "⚪",
          "score": 3
        },
        "teamB": {
          "name": "Barcelona",
          "code": "BAR",
          "flag": "🔴🔵",
          "score": 2
        },
        "events": [
          {
            "min": "6'",
            "type": "goal",
            "player": "Christensen",
            "detail": "Header from corner"
          },
          {
            "min": "18'",
            "type": "goal",
            "player": "Vinicius Jr.",
            "detail": "Penalty Kick"
          },
          {
            "min": "69'",
            "type": "goal",
            "player": "Fermín López",
            "detail": "Rebound tap-in"
          },
          {
            "min": "73'",
            "type": "goal",
            "player": "Lucas Vázquez",
            "detail": "Far post volley"
          },
          {
            "min": "90+1'",
            "type": "goal",
            "player": "Jude Bellingham",
            "detail": "Match Winner"
          }
        ],
        "stats": {
          "possession": [
            47,
            53
          ],
          "xG": [
            "2.35",
            "1.74"
          ],
          "shots": [
            14,
            15
          ],
          "shotsOnTarget": [
            8,
            6
          ],
          "corners": [
            4,
            7
          ],
          "fouls": [
            11,
            13
          ]
        }
      },
      {
        "id": "foot_3",
        "league": "Premier League — Title Showdown",
        "venue": "Anfield, Liverpool",
        "status": "LIVE — 62' Minute",
        "teamA": {
          "name": "Liverpool",
          "code": "LIV",
          "flag": "🔴",
          "score": 1
        },
        "teamB": {
          "name": "Arsenal",
          "code": "ARS",
          "flag": "⚪🔴",
          "score": 1
        },
        "events": [
          {
            "min": "14'",
            "type": "goal",
            "player": "Bukayo Saka",
            "detail": "Left-foot near post finish"
          },
          {
            "min": "49'",
            "type": "goal",
            "player": "Mohamed Salah",
            "detail": "Inside cut and curling strike"
          }
        ],
        "stats": {
          "possession": [
            52,
            48
          ],
          "xG": [
            "1.62",
            "1.40"
          ],
          "shots": [
            11,
            10
          ],
          "shotsOnTarget": [
            5,
            4
          ]
        }
      },
      {
        "id": "foot_4",
        "league": "Bundesliga — Der Klassiker",
        "venue": "Signal Iduna Park, Dortmund",
        "status": "FULL TIME",
        "teamA": {
          "name": "Borussia Dortmund",
          "code": "BVB",
          "flag": "🟡",
          "score": 2
        },
        "teamB": {
          "name": "Bayern Munich",
          "code": "BAY",
          "flag": "🔴",
          "score": 2
        },
        "events": [
          {
            "min": "22'",
            "type": "goal",
            "player": "Harry Kane",
            "detail": "Header inside 6-yard box"
          },
          {
            "min": "35'",
            "type": "goal",
            "player": "Jamal Musiala",
            "detail": "Dribble past two defenders"
          },
          {
            "min": "71'",
            "type": "goal",
            "player": "Julian Brandt",
            "detail": "Volley from edge of box"
          }
        ],
        "stats": {
          "possession": [
            45,
            55
          ],
          "xG": [
            "1.80",
            "2.10"
          ],
          "shots": [
            13,
            16
          ],
          "shotsOnTarget": [
            6,
            7
          ]
        }
      }
    ],
    "badminton": [
      {
        "id": "badm_1",
        "tournament": "All England Open Badminton Championships (Super 1000)",
        "venue": "Utilita Arena, Birmingham",
        "status": "LIVE — Game 3 (Decider)",
        "playerA": {
          "name": "Viktor Axelsen",
          "country": "DEN",
          "flag": "🇩🇰",
          "rank": 2,
          "gameScores": [
            21,
            18,
            16
          ]
        },
        "playerB": {
          "name": "Shi Yuqi",
          "country": "CHN",
          "flag": "🇨🇳",
          "rank": 1,
          "gameScores": [
            19,
            21,
            14
          ]
        },
        "currentScore": "Axelsen 16 - 14 Shi Yuqi (Game 3)",
        "stats": {
          "longestRally": "46 shots",
          "fastestSmash": "414 km/h (Axelsen)",
          "unforcedErrors": [
            14,
            18
          ],
          "netKillSuccess": [
            "82%",
            "74%"
          ]
        }
      },
      {
        "id": "badm_2",
        "tournament": "BWF World Tour Super 750 — French Open",
        "venue": "Adidas Arena, Paris",
        "status": "FULL TIME — Final",
        "playerA": {
          "name": "Satwik / Chirag",
          "country": "IND",
          "flag": "🇮🇳",
          "rank": 3,
          "gameScores": [
            21,
            21
          ]
        },
        "playerB": {
          "name": "Lee Yang / Wang Chi-lin",
          "country": "TPE",
          "flag": "🇹🇼",
          "rank": 8,
          "gameScores": [
            11,
            17
          ]
        },
        "currentScore": "Satwik / Chirag won 2-0 (Champion)",
        "stats": {
          "longestRally": "34 shots",
          "fastestSmash": "448 km/h (Satwik)",
          "unforcedErrors": [
            8,
            16
          ],
          "netKillSuccess": [
            "88%",
            "65%"
          ]
        }
      }
    ]
  }
};

const defaultDashboardData = {
  "lastUpdated": "11:43:44 PM",
  "source": "Verified Sports Feeds (ICC • UEFA/Opta • BWF Statutes)",
  "hasLiveFeed": false,
  "upcomingFixtures": {
    "cricket": [
      {
        "id": "cric_fix_1",
        "match": "Border-Gavaskar Trophy — 5th Test Match",
        "teams": "Australia vs India",
        "venue": "Sydney Cricket Ground (SCG)",
        "date": "Jan 03 - 07, 2025",
        "time": "05:00 AM IST (23:30 GMT)",
        "format": "Test (5-Day Red Ball)",
        "tacticalKey": "Spin-friendly Day 4/5 SCG pitch. Ashwin vs Smith technical chess match."
      },
      {
        "id": "cric_fix_2",
        "match": "ICC Champions Trophy — Group A Opener",
        "teams": "India vs Pakistan",
        "venue": "Dubai International Stadium",
        "date": "Feb 23, 2025",
        "time": "02:00 PM IST",
        "format": "ODI (50 Overs)",
        "tacticalKey": "Shaheen Afridi opening spell swing vs Rohit Sharma front-foot pull."
      }
    ],
    "football": [
      {
        "id": "foot_fix_1",
        "league": "UEFA Champions League — Semi-Final 1st Leg",
        "teams": "Real Madrid vs Bayern Munich",
        "venue": "Santiago Bernabéu, Madrid",
        "date": "Apr 30, 2025",
        "time": "20:00 BST (00:30 IST)",
        "tacticalKey": "High line vs rapid transition counters. Vinicius Jr. vs Alphonso Davies wide footrace."
      },
      {
        "id": "foot_fix_2",
        "league": "Premier League — The Manchester Derby",
        "teams": "Manchester United vs Manchester City",
        "venue": "Old Trafford, Manchester",
        "date": "May 04, 2025",
        "time": "16:30 BST",
        "tacticalKey": "City possession strangulation vs United fast break through wing channels."
      }
    ],
    "badminton": [
      {
        "id": "badm_fix_1",
        "match": "All England Open Badminton Championships (Super 1000)",
        "teams": "Shi Yuqi (CHN) vs Viktor Axelsen (DEN)",
        "venue": "Utilita Arena, Birmingham",
        "date": "Mar 16, 2025",
        "time": "14:00 GMT",
        "format": "Men's Singles Final",
        "tacticalKey": "Axelsen steep angled smash vs Shi Yuqi deceptive cross-court net tumble."
      },
      {
        "id": "badm_fix_2",
        "match": "BWF World Tour Finals — Men's Doubles",
        "teams": "Satwik / Chirag (IND) vs Liang / Wang (CHN)",
        "venue": "Hangzhou Olympic Sports Expo Center",
        "date": "Dec 15, 2024",
        "time": "18:00 Local",
        "format": "Men's Doubles Final",
        "tacticalKey": "Flat drive speed and forecourt dominance deciding 3-shot rally winners."
      }
    ]
  },
  "recentResults": {
    "cricket": [
      {
        "match": "ICC Men's T20 World Cup 2024 Final",
        "teams": "India (176/7) def. South Africa (169/8) by 7 runs",
        "summary": "Virat Kohli 76 (59) and Hardik Pandya 3/20 in death overs sealed India's historic ICC trophy triumph in Barbados.",
        "winner": "India"
      },
      {
        "match": "ICC World Test Championship Final 2023",
        "teams": "Australia (469 & 270/8d) def. India (296 & 234) by 209 runs",
        "summary": "Travis Head (163) and Steve Smith (121) built a mammoth first-innings partnership at The Oval.",
        "winner": "Australia"
      }
    ],
    "football": [
      {
        "match": "UEFA Champions League Final 2024",
        "teams": "Real Madrid 2 - 0 Borussia Dortmund",
        "summary": "Dani Carvajal header and Vinicius Jr. angled finish delivered Real Madrid's record-extending 15th European title at Wembley.",
        "winner": "Real Madrid"
      },
      {
        "match": "UEFA Euro 2024 Final",
        "teams": "Spain 2 - 1 England",
        "summary": "Nico Williams and Mikel Oyarzabal goals crowned Spain four-time European champions in Berlin.",
        "winner": "Spain"
      }
    ],
    "badminton": [
      {
        "match": "Paris 2024 Olympic Men's Singles Final",
        "teams": "Viktor Axelsen (DEN) def. Kunlavut Vitidsarn (THA) 21-11, 21-11",
        "summary": "Axelsen retained Olympic Gold with a commanding two-game sweep, becoming the second man after Lin Dan to win back-to-back golds.",
        "winner": "Viktor Axelsen (DEN)"
      },
      {
        "match": "Paris 2024 Olympic Women's Singles Final",
        "teams": "An Se-young (KOR) def. He Bingjiao (CHN) 21-13, 21-16",
        "summary": "World Number 1 An Se-young completed her legendary season with her maiden Olympic gold medal.",
        "winner": "An Se-young (KOR)"
      }
    ]
  },
  "rankings": {
    "cricket": {
      "iccRankings": {
        "test": [
          {
            "rank": 1,
            "team": "Australia",
            "rating": 124
          },
          {
            "rank": 2,
            "team": "India",
            "rating": 120
          },
          {
            "rank": 3,
            "team": "England",
            "rating": 108
          },
          {
            "rank": 4,
            "team": "South Africa",
            "rating": 104
          }
        ],
        "odi": [
          {
            "rank": 1,
            "team": "India",
            "rating": 118
          },
          {
            "rank": 2,
            "team": "Australia",
            "rating": 116
          },
          {
            "rank": 3,
            "team": "South Africa",
            "rating": 112
          },
          {
            "rank": 4,
            "team": "Pakistan",
            "rating": 106
          }
        ],
        "t20i": [
          {
            "rank": 1,
            "team": "India",
            "rating": 268
          },
          {
            "rank": 2,
            "team": "Australia",
            "rating": 256
          },
          {
            "rank": 3,
            "team": "England",
            "rating": 253
          },
          {
            "rank": 4,
            "team": "West Indies",
            "rating": 250
          }
        ]
      },
      "playerRankings": {
        "odiBatters": [
          "Babar Azam (PAK)",
          "Rohit Sharma (IND)",
          "Shubman Gill (IND)",
          "Virat Kohli (IND)"
        ],
        "testBatters": [
          "Joe Root (ENG)",
          "Kane Williamson (NZ)",
          "Steve Smith (AUS)",
          "Yashasvi Jaiswal (IND)"
        ],
        "t20Bowlers": [
          "Adil Rashid (ENG)",
          "Akeal Hosein (WI)",
          "Wanindu Hasaranga (SL)",
          "Jasprit Bumrah (IND)"
        ]
      },
      "recentTournament": "ICC Men's T20 World Cup 2024 Champion: India (Defeated South Africa by 7 runs in Barbados)"
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
      "uclChampion": "Real Madrid (2024 Champion — 15th European Cup, defeated Borussia Dortmund 2-0)",
      "premierLeagueLeader": "Liverpool / Manchester City title race (2024-25 campaign)",
      "ballonDor2024": "Rodri (Manchester City & Spain — UEFA Euro 2024 & Premier League Champion)"
    },
    "badminton": {
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
          }
        ]
      },
      "olympicChampionParis": "Viktor Axelsen (Men's Singles), An Se-young (Women's Singles)"
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
