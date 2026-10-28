/**
 * Sports Classifier & Strict Scope Guardrail Node
 * Categorizes user queries into Cricket, Football, Badminton, or Out-of-Scope.
 * Enforces zero-hallucination policy by preventing off-topic extrapolation.
 */

export function classifySportsQuery(query, history = []) {
  const q = query.toLowerCase().trim();

  // Cricket Signals
  const cricketKeywords = [
    'cricket', 'kohli', 'sachin', 'dhoni', 'rohit', 'bumrah', 'babar', 'warne', 'murali',
    'lara', 'kallis', 'bradman', 'ashwin', 'shami', 'gill', 'pant', 'hardik', 'jadeja',
    'steyn', 'mcgrath', 'akram', 'ponting', 'root', 'smith', 'williamson', 'stokes',
    'head', 'cummins', 'starc', 'boult', 'afridi', 'rizwan', 'shaheen', 'yuvraj', 'sehwag',
    'ganguly', 'dravid', 'kapil dev', 'gavaskar', 'ipl', 'bcci', 'icc', 'ashes', 'test match',
    'odi', 't20', 't20i', 'wtc', 'world test championship', 'cwc', 'cricket world cup',
    'champions trophy', 'pitch', 'wicket', 'stumps', 'bails', 'popping crease', 'bowling',
    'batting', 'lbw', 'leg before wicket', 'drs', 'ultraedge', 'snicko', 'hawk-eye',
    'swing', 'reverse swing', 'inswinger', 'outswinger', 'doosra', 'carrom ball', 'googly',
    'flipper', 'leg break', 'off break', 'yorker', 'bouncer', 'beamer', 'cover drive',
    'pull shot', 'hook shot', 'sweep shot', 'reverse sweep', 'dilscoop', 'switch hit',
    'slips', 'gully', 'silly point', 'short leg', 'long on', 'long off', 'cow corner',
    'powerplay', 'death overs', 'follow on', 'dls', 'duckworth lewis', 'super over',
    'hat trick', 'century', 'duck', 'run out', 'stumped', 'boundary', 'sixer', 'chennai super kings',
    'mumbai indians', 'rcb', 'kkr', 'srh', 'dc', 'rajasthan royals', 'punjab kings', 'gujarat titans'
  ];

  // Football Signals
  const footballKeywords = [
    'football', 'soccer', 'messi', 'ronaldo', 'cr7', 'maradona', 'pele', 'cruyff', 'zidane',
    'haaland', 'mbappe', 'neymar', 'kaka', 'ronaldinho', 'r9', 'nazario', 'van basten',
    'gullit', 'muller', 'henry', 'bergkamp', 'modric', 'de bruyne', 'kroos', 'iniesta',
    'xavi', 'busquets', 'pirlo', 'xabi alonso', 'gerrard', 'lampard', 'scholes', 'maldini',
    'beckenbauer', 'baresi', 'ramos', 'van dijk', 'cannavaro', 'yashin', 'buffon', 'neuer',
    'casillas', 'courtois', 'alisson', 'ederson', 'guardiola', 'klopp', 'ancelotti', 'ferguson',
    'mourinho', 'simeone', 'fifa', 'uefa', 'world cup', 'champions league', 'ucl', 'europa league',
    'copa america', 'euros', 'euro 2024', 'premier league', 'la liga', 'serie a', 'bundesliga',
    'ligue 1', 'real madrid', 'barcelona', 'manchester united', 'manchester city', 'liverpool',
    'arsenal', 'chelsea', 'bayern munich', 'psg', 'juventus', 'inter milan', 'ac milan',
    'atletico madrid', 'offside', 'law 11', 'var', 'video assistant referee', 'dogso',
    'handball', 'penalty kick', 'penalty shootout', 'panenka', 'yellow card', 'red card',
    'direct free kick', 'indirect free kick', 'corner kick', 'goal kick', '4-3-3', '4-2-3-1',
    '3-5-2', 'tiki-taka', 'gegenpressing', 'catenaccio', 'low block', 'high press',
    'false nine', 'false 9', 'regista', 'inverted winger', 'inverted fullback', 'sweeper keeper',
    'xg', 'expected goals', 'xa', 'ppda', 'field tilt', 'ballon d or', 'golden boot',
    'golden ball', 'treble', 'hat trick', 'transfer fee', 'bosman ruling', 'financial fair play'
  ];

  // Badminton Signals
  const badmintonKeywords = [
    'badminton', 'shuttlecock', 'shuttle', 'birdie', 'racket', 'racquet', 'smash', 'jump smash',
    'stick smash', 'clear', 'high clear', 'attacking clear', 'drop shot', 'sliced drop',
    'reverse slice', 'tumbling net shot', 'spinning net shot', 'net kill', 'hairpin',
    'drive', 'flat drive', 'push shot', 'lob', 'split step', 'chasse step', 'scissor kick',
    'footwork', 't-junction', 'short service line', 'doubles sideline', 'singles sideline',
    'service height', '1.15m', '1.15 meters', 'service judge', '21 points', 'rally point',
    'deuce', 'cap at 30', 'bwf', 'badminton world federation', 'olympic badminton',
    'world championships', 'thomas cup', 'uber cup', 'sudirman cup', 'all england',
    'all england open', 'bwf world tour', 'super 1000', 'super 750', 'super 500',
    'instant review system', 'irs challenge', 'hawk-eye badminton', 'lin dan', 'super dan',
    'lee chong wei', 'datuk', 'taufik hidayat', 'peter gade', 'viktor axelsen', 'kento momota',
    'chen long', 'kunlavut vitidsarn', 'shi yuqi', 'antonsen', 'saina nehwal', 'pv sindhu',
    'sindhu', 'carolina marin', 'tai tzu ying', 'an se young', 'akane yamaguchi', 'chen yufei',
    'satwiksairaj rankireddy', 'chirag shetty', 'sat-chi', 'lakshya sen', 'kidambi srikanth',
    'prannoy', 'prakash padukone', 'pullela gopichand', 'hendra setiawan', 'mohammad ahsan',
    'the daddies', 'cai yun', 'fu haifeng', 'kevin sanjaya', 'marcus gideon', 'minions',
    '565 km/h', 'smash speed', '438 km/h', 'pearly tan', 'string tension', 'head heavy',
    'head light', 'even balance', 'yonex', 'victor', 'li-ning'
  ];

  let cricketMatches = 0;
  let footballMatches = 0;
  let badmintonMatches = 0;

  cricketKeywords.forEach(k => {
    if (q.includes(k)) cricketMatches++;
  });
  footballKeywords.forEach(k => {
    if (q.includes(k)) footballMatches++;
  });
  badmintonKeywords.forEach(k => {
    if (q.includes(k)) badmintonMatches++;
  });

  // Greetings or Meta chat check
  const isGreeting = /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|who are you|what can you do|help me|what sports do you know)[\?!.]*$/i.test(q);
  if (isGreeting) {
    return {
      sport: 'greeting',
      isSports: true,
      confidence: 1.0,
      scores: { cricket: 0, football: 0, badminton: 0 }
    };
  }

  const maxMatches = Math.max(cricketMatches, footballMatches, badmintonMatches);

  // Check for multi-sport comparative queries (e.g. cricket vs football)
  const matchedSports = [];
  if (cricketMatches > 0) matchedSports.push('cricket');
  if (footballMatches > 0) matchedSports.push('football');
  if (badmintonMatches > 0) matchedSports.push('badminton');

  if (matchedSports.length > 1) {
    return {
      sport: 'multi_sports',
      isSports: true,
      matchedSports,
      confidence: 0.95,
      scores: {
        cricket: cricketMatches,
        football: footballMatches,
        badminton: badmintonMatches
      }
    };
  }

  // If no direct sport keyword is detected, check if it's a conversational follow-up to prior session history
  if (maxMatches === 0) {
    if (history && history.length > 0) {
      const priorSportMsg = history.slice().reverse().find(m => ['cricket', 'football', 'badminton', 'multi_sports'].includes(m.sport));
      if (priorSportMsg) {
        // Conversational follow-ups (e.g. "give me an example", "why?", "tell me more", "how about vs ...")
        const isFollowUpPattern = /^(give|show|tell|explain|what|how|why|can|could|please|another|more|example|difference|detail|clarify|elaborate|compare|continue|and|then|what about)/i.test(q);
        if (isFollowUpPattern || q.length < 80) {
          return {
            sport: priorSportMsg.sport,
            isSports: true,
            isFollowUp: true,
            confidence: 0.9,
            scores: { cricket: priorSportMsg.sport === 'cricket' ? 1 : 0, football: priorSportMsg.sport === 'football' ? 1 : 0, badminton: priorSportMsg.sport === 'badminton' ? 1 : 0 }
          };
        }
      }
    }

    // Check general sport words
    const isGeneralSports = /sport|athlete|coach|referee|tournament|trophy|match|stadium|championship|olympic/i.test(q);
    if (isGeneralSports) {
      return {
        sport: 'general_sports',
        isSports: true,
        confidence: 0.6,
        scores: { cricket: 0, football: 0, badminton: 0 }
      };
    }

    return {
      sport: 'out_of_scope',
      isSports: false,
      confidence: 0.95,
      scores: { cricket: 0, football: 0, badminton: 0 }
    };
  }

  // Determine top sport
  let identifiedSport = 'cricket';
  if (footballMatches > cricketMatches && footballMatches >= badmintonMatches) {
    identifiedSport = 'football';
  } else if (badmintonMatches > cricketMatches && badmintonMatches > footballMatches) {
    identifiedSport = 'badminton';
  } else if (cricketMatches >= footballMatches && cricketMatches >= badmintonMatches) {
    identifiedSport = 'cricket';
  }

  return {
    sport: identifiedSport,
    isSports: true,
    confidence: Math.min(1.0, 0.5 + maxMatches * 0.15),
    scores: {
      cricket: cricketMatches,
      football: footballMatches,
      badminton: badmintonMatches
    }
  };
}

export function generateScopeRefusal(query) {
  return {
    role: 'assistant',
    sport: 'out_of_scope',
    grounding_score: 100,
    citations: [],
    content: `### 🛡️ SportsAI Strict Tri-Sport Oracle Guardrail

I am **SportsAI**, an intelligence engine strictly calibrated to provide **zero-hallucination, verified knowledge** for **Cricket, Football, and Badminton**.

Your query:
> *"**${query.replace(/[*#]/g, '')}**"*

appears to fall outside our three core sports domains. To maintain 100% factual accuracy and avoid hallucinations, my neural guardrails decline non-sports or unrelated queries.

#### 🎯 Ask me anything across our Tri-Sport Compendium:
- 🏏 **Cricket**: LBW Law 36, DRS ball tracking, reverse swing aerodynamics, Virat Kohli vs Sachin Tendulkar stats, IPL 2024 records, or WTC points formulas.
- ⚽ **Football**: IFAB Law 11 offside nuances, VAR review protocols, Pep's 4-3-3 Tiki-Taka, Messi vs Ronaldo UCL records, or xG metric science.
- 🏸 **Badminton**: BWF 1.15m fixed service laws, 565 km/h smash aerodynamics, Viktor Axelsen tactics, PV Sindhu Olympic finals, or the Lin-Lee rivalry.

*Where shall we direct your sports inquiry?*`
  };
}
