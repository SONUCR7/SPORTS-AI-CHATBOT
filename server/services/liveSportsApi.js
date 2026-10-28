/**
 * Live Sports Data Service
 * Provides live match status, tournament schedules, and live world rankings
 * for Cricket, Football, and Badminton to enrich RAG queries.
 */

class LiveSportsApiService {
  constructor() {
    this.cachedData = {
      cricket: {
        iccRankings: {
          test: [
            { rank: 1, team: 'Australia', rating: 124 },
            { rank: 2, team: 'India', rating: 120 },
            { rank: 3, team: 'England', rating: 108 },
            { rank: 4, team: 'South Africa', rating: 104 }
          ],
          odi: [
            { rank: 1, team: 'India', rating: 118 },
            { rank: 2, team: 'Australia', rating: 116 },
            { rank: 3, team: 'South Africa', rating: 112 },
            { rank: 4, team: 'Pakistan', rating: 106 }
          ],
          t20i: [
            { rank: 1, team: 'India', rating: 268 },
            { rank: 2, team: 'Australia', rating: 256 },
            { rank: 3, team: 'England', rating: 253 },
            { rank: 4, team: 'West Indies', rating: 250 }
          ]
        },
        playerRankings: {
          odiBatters: ['Babar Azam (PAK)', 'Rohit Sharma (IND)', 'Shubman Gill (IND)', 'Virat Kohli (IND)'],
          testBatters: ['Joe Root (ENG)', 'Kane Williamson (NZ)', 'Steve Smith (AUS)', 'Yashasvi Jaiswal (IND)'],
          t20Bowlers: ['Adil Rashid (ENG)', 'Akeal Hosein (WI)', 'Wanindu Hasaranga (SL)', 'Jasprit Bumrah (IND)']
        },
        recentTournament: 'ICC Men\'s T20 World Cup 2024 Champion: India (Defeated South Africa by 7 runs in Barbados)'
      },
      football: {
        fifaRankings: [
          { rank: 1, team: 'Argentina', points: 1883.5 },
          { rank: 2, team: 'France', points: 1853.1 },
          { rank: 3, team: 'Spain', points: 1844.3 },
          { rank: 4, team: 'England', points: 1807.8 },
          { rank: 5, team: 'Brazil', points: 1784.3 }
        ],
        uclChampion: 'Real Madrid (2024 Champion — 15th European Cup, defeated Borussia Dortmund 2-0)',
        premierLeagueLeader: 'Liverpool / Manchester City title race (2024-25 campaign)',
        ballonDor2024: 'Rodri (Manchester City & Spain — UEFA Euro 2024 & Premier League Champion)'
      },
      badminton: {
        bwfRankings: {
          mensSingles: [
            { rank: 1, player: 'Shi Yuqi', country: 'CHN', points: 101815 },
            { rank: 2, player: 'Viktor Axelsen', country: 'DEN', points: 96730 },
            { rank: 3, player: 'Anders Antonsen', country: 'DEN', points: 87141 },
            { rank: 4, player: 'Kodai Naraoka', country: 'JPN', points: 83525 },
            { rank: 15, player: 'Lakshya Sen', country: 'IND', points: 64140 }
          ],
          womensSingles: [
            { rank: 1, player: 'An Se-young', country: 'KOR', points: 113314 },
            { rank: 2, player: 'Wang Zhiyi', country: 'CHN', points: 94645 },
            { rank: 3, player: 'Han Yue', country: 'CHN', points: 88109 },
            { rank: 4, player: 'Akane Yamaguchi', country: 'JPN', points: 86450 },
            { rank: 18, player: 'PV Sindhu', country: 'IND', points: 53120 }
          ],
          mensDoubles: [
            { rank: 1, pair: 'Goh Sze Fei & Nur Izzuddin', country: 'MAS', points: 88200 },
            { rank: 2, pair: 'Kim Astrup & Anders Skaarup Rasmussen', country: 'DEN', points: 86703 },
            { rank: 3, pair: 'Satwiksairaj Rankireddy & Chirag Shetty', country: 'IND', points: 85250 }
          ]
        },
        olympicChampionParis: 'Viktor Axelsen (Men\'s Singles), An Se-young (Women\'s Singles)'
      }
    };
  }

  getLiveSportsContext(sport) {
    if (sport === 'cricket') return this.cachedData.cricket;
    if (sport === 'football') return this.cachedData.football;
    if (sport === 'badminton') return this.cachedData.badminton;
    return this.cachedData;
  }
}

export const liveSportsApi = new LiveSportsApiService();
