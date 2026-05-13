import React, { useState, useEffect, useRef, useCallback, memo } from 'react';

/* ─── Word / Sentence / Paragraph data ─── */
const EW = ['cat','dog','run','fly','sun','map','hat','big','cup','red','sea','top','box','let','fix','mix','pin','cut','win','zip','ace','bat','bed','bit','bug','bus','cab','can','cap','cod','cop','cot','cow','cry','cub','dam','dip','dot','dry','dug','ear','eat','egg','elk','end','fan','fig','fit','fog','fox','fun','gap','gas','gem','gin','got','gum','gun','gut','ham','hen','hid','hip','hit','hog','hop','hot','hub','hug','hum','hut','ice','ill','ink','jam','jot','joy','jug','key','kid','kit','lab','lag','lap','law','lay','leg','lid','lip','lit','log','lot','mad','man','mat','mop','mud','mug','nap','net','nip','nod','nut','oak','odd','oil','old','out','own','pad','pan','paw','pea','peg','pet','pig','pit','pod','pop','pot','pub','pup','put','rag','ram','ran','rap','rat','raw','ray','rib','rid','rip','rob','rod','rot','row','rub','rug','rum','rut','sad','sap','sat','saw','say','set','sew','sin','sip','sir','sit','six','ski','sky','sob','son','spa','spy','sub','sum','tab','tan','tap','tar','tax','ten','tie','tin','tip','ton','toy','try','tub','tug','two','van','vat','vet','vow','wag','war','was','way','web','wed','wet','wig','wit','yam','yap','you','zap'];

const MS = ['The quick brown fox jumps over the lazy dog.','She sells seashells by the seashore every day.','How much wood would a woodchuck chuck if it could?','The sun rises in the east and sets in the west.','A journey of a thousand miles begins with one step.','Actions speak louder than words every single time.','Knowledge is power, and power is responsibility.','The early bird catches the worm each morning.','Practice makes perfect over time with effort.','Every cloud has a silver lining within it.','Time flies when you are having genuine fun.','Better late than never, but better early always.','Two wrongs do not make a right at all.','The pen is mightier than the sword indeed.','You cannot judge a book by its cover ever.','All that glitters is not gold in life.','When in Rome, do as the Romans do.','Good things come to those who wait patiently.','Honesty is the best policy in all the world.','The grass is always greener on the other side.','Look before you leap into any big decision.','Where there is smoke, there is fire nearby.','Laughter is the best medicine for the soul.','Great minds think alike most of the time.','Necessity is the mother of all great invention.','Too many cooks will always spoil the broth.','A rolling stone gathers absolutely no moss.','You truly reap exactly what you sow in life.','The strongest oak was once a tiny little acorn.','Life is what happens while you are making plans.','In the middle of great difficulty lies opportunity.','Dream big and work hard every single day.','Success is not final, and failure is not fatal.','It always seems impossible until it is fully done.','Be the change you wish to see in the world.','The secret of change is to build the new.','Stars cannot shine without darkness all around.','A smooth sea never made a truly skilled sailor.','Believe you can and you are halfway there already.','The only way to do great work is to love it.'];

const HP = ['The human brain is the most complex structure known. It contains roughly eighty-six billion neurons, each connected to thousands of others. These connections form networks responsible for everything we think and feel. Scientists continue to unravel its mysteries every year.','Climate change poses one of the greatest threats today. Rising global temperatures are causing glaciers to melt rapidly. Sea levels are rising and weather patterns are shifting. Extreme weather events are becoming more frequent and intense worldwide.','The internet has transformed how human beings communicate. In just decades it connected billions of people globally. Social media platforms reshaped politics, culture, and commerce. Yet digital inequality remains a persistent global challenge today.','Artificial intelligence is rapidly reshaping every industry. Machine learning can now diagnose diseases and translate languages. Concerns about job loss and algorithmic bias are growing louder. Society must carefully navigate these complex technological transitions ahead.','Space exploration has always captured human imagination deeply. From the moon landing to powerful space telescopes, we pushed limits. Today private companies are joining agencies racing to Mars. Colonizing other planets may define our species future entirely.','Biodiversity is the very foundation of all life on Earth. Healthy ecosystems depend on rich variety of living organisms. Human activities are causing species to go extinct at alarming rates. Protecting natural habitats is essential for long-term sustainability.','Music is a universal language transcending all cultural boundaries. From ancient drumbeats to classical orchestras, it accompanied humanity. Neuroscientists found music activates nearly every brain region at once. This makes it uniquely powerful among all human experiences.','Quantum mechanics is the strangest theory in all physics. Particles can exist in multiple states at the same time. They can become entangled across vast cosmic distances instantly. These phenomena form the foundation of modern electronics and computers.','The history of medicine is a story of great perseverance. From penicillin to vaccines, breakthroughs have saved millions of lives. Today gene editing technologies offer the possibility of curing disease. Science continues to push the boundaries of what is possible.','Philosophy teaches us to question what we take for granted. From Socrates to modern thinkers, ideas have shaped civilization. Critical thinking, logic, and ethics guide our understanding of the world. Studying philosophy makes us better thinkers and kinder human beings.'];

/* ─── Level config ─── */
const LCFG = {
  easy:   { label: 'Easy',   color: 'easy',   time: 30, sg: 6, bs: 4, desc: '3-letter words',  tl: '30 sec · Space to submit' },
  medium: { label: 'Medium', color: 'medium', time: 45, sg: 4, bs: 5, desc: 'Full sentences',  tl: '45 sec · Enter to submit' },
  hard:   { label: 'Hard',   color: 'hard',   time: 60, sg: 3, bs: 6, desc: 'Full paragraphs', tl: '60 sec · Enter to submit' },
};

/* ─── Rank helper ─── */
function getRank(wpm, lvl) {
  const t = lvl === 'easy' ? [70,50,30,15] : lvl === 'medium' ? [60,40,25,12] : [50,35,20,10];
  if (wpm >= t[0]) return { l: 'LIGHTNING',    c: '#00ffb2' };
  if (wpm >= t[1]) return { l: 'EXPERT',       c: '#00c8ff' };
  if (wpm >= t[2]) return { l: 'ADVANCED',     c: '#aa88ff' };
  if (wpm >= t[3]) return { l: 'INTERMEDIATE', c: '#ffaa00' };
  return                  { l: 'BEGINNER',     c: '#ff6644' };
}

/* ─── Shuffle ─── */
function shuf(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/* ─── Sub-components ─── */
const WrongMsg = memo(({ typed, expected, level }) => {
  const title = level === 'easy' ? 'Wrong word!' : level === 'medium' ? 'Wrong sentence!' : 'Wrong paragraph!';
  const short  = expected.length > 60 ? expected.slice(0, 60) + '…' : expected;
  return (
    <div className="wrong-msg" role="alert">
      <div className="wm-icon" aria-hidden="true">✕</div>
      <div className="wm-body">
        <div className="wm-title">{title}</div>
        <div className="wm-detail">
          <span style={{ opacity: .65 }}>You typed: </span>
          <span>{typed.length > 60 ? typed.slice(0, 60) + '…' : typed}</span>
          <br />
          <span style={{ opacity: .65 }}>Expected: </span>
          <span>{short}</span>
        </div>
      </div>
    </div>
  );
});

const ThemeBtn = memo(({ dark, setDark }) => (
  <button
    className="theme-btn"
    onClick={() => setDark(d => !d)}
    aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
  >
    {dark ? '☀ Light' : '⬤ Dark'}
  </button>
));

/* ══════════════════════════════════════════════════════════════
   APP
══════════════════════════════════════════════════════════════ */
function App() {
  const [dark,      setDark]      = useState(true);
  const [screen,    setScreen]    = useState('start');
  const [selLvl,    setSelLvl]    = useState(null);
  const [lvl,       setLvl]       = useState(null);
  const [queue,     setQueue]     = useState([]);
  const [current,   setCurrent]   = useState('');
  const [inp,       setInp]       = useState('');
  const [tLeft,     setTLeft]     = useState(30);
  const [streak,    setStreak]    = useState(0);
  const [correct,   setCorrect]   = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [totalT,    setTotalT]    = useState(0);
  const [inpState,  setInpState]  = useState('idle');
  const [shake,     setShake]     = useState(false);
  const [bonusMsg,  setBonusMsg]  = useState('');
  const [showBonus, setShowBonus] = useState(false);
  const [startMs,   setStartMs]   = useState(null);
  const [wrongInfo, setWrongInfo] = useState(null);

  const timerR = useRef(null);
  const bonusR  = useRef(null);
  const wrongR  = useRef(null);
  const inpR    = useRef(null);

  /* Theme */
  useEffect(() => { document.body.className = dark ? '' : 'light'; }, [dark]);

  /* Source picker */
  const src = useCallback((l) => l === 'easy' ? EW : l === 'medium' ? MS : HP, []);

  /* Load next item */
  const loadNext = useCallback((q, l) => {
    const arr = q.length < 3 ? [...q, ...shuf(src(l))] : q;
    setCurrent(arr[0]); setQueue(arr.slice(1)); setInp(''); setInpState('idle');
    return arr.slice(1);
  }, [src]);

  /* Bonus time */
  const addTime = useCallback((sec) => {
    clearInterval(timerR.current);
    setTLeft(t => Math.min(t + sec, 150));
    timerR.current = setInterval(() => {
      setTLeft(t => {
        if (t <= 0.1) { clearInterval(timerR.current); setScreen('over'); return 0; }
        return +(t - 0.1).toFixed(1);
      });
    }, 100);
  }, []);

  /* Show wrong popup */
  const showWrong = useCallback((typed, expected) => {
    setWrongInfo({ typed, expected });
    clearTimeout(wrongR.current);
    wrongR.current = setTimeout(() => setWrongInfo(null), 3500);
  }, []);

  /* Start game */
  const startGame = useCallback(() => {
    if (!selLvl) return;
    const cfg = LCFG[selLvl];
    const q   = shuf(src(selLvl));
    setLvl(selLvl); setQueue(q.slice(1)); setCurrent(q[0]);
    setInp(''); setTLeft(cfg.time); setStreak(0); setCorrect(0); setIncorrect(0);
    setTotalT(0); setInpState('idle'); setStartMs(null);
    setShowBonus(false); setWrongInfo(null);
    setScreen('game');
    setTimeout(() => inpR.current && inpR.current.focus(), 80);
  }, [selLvl, src]);

  /* Countdown */
  useEffect(() => {
    if (screen !== 'game') return;
    timerR.current = setInterval(() => {
      setTLeft(t => {
        if (t <= 0.1) { clearInterval(timerR.current); setScreen('over'); return 0; }
        return +(t - 0.1).toFixed(1);
      });
    }, 100);
    return () => clearInterval(timerR.current);
  }, [screen]);

  /* Correct answer */
  const handleCorrect = useCallback((typedLen) => {
    if (!startMs) return;
    const ns = streak + 1;
    setStreak(ns); setCorrect(c => c + 1); setTotalT(n => n + 1); setInpState('correct');
    const cfg = LCFG[lvl];
    if (ns % cfg.sg === 0) {
      addTime(cfg.bs);
      setBonusMsg(`${cfg.sg}-STREAK! +${cfg.bs}s BONUS`);
      setShowBonus(true);
      clearTimeout(bonusR.current);
      bonusR.current = setTimeout(() => setShowBonus(false), 2200);
    }
  }, [streak, lvl, startMs, addTime]);

  /* Wrong answer */
  const handleWrong = useCallback((typed, expected) => {
    setStreak(0); setIncorrect(i => i + 1); setTotalT(n => n + 1);
    setInpState('wrong'); setShake(true);
    setTimeout(() => setShake(false), 300);
    showWrong(typed, expected);
  }, [showWrong]);

  /* Easy mode handlers */
  const submitEasy = useCallback((val) => {
    if (!startMs) setStartMs(Date.now());
    const typed = val.trim();
    if (!typed) return;
    if (typed === current) {
      handleCorrect(typed.length);
      setTimeout(() => setQueue(q => loadNext(q, 'easy')), 80);
    } else {
      handleWrong(typed, current);
      setTimeout(() => setQueue(q => loadNext(q, 'easy')), 350);
    }
  }, [current, handleCorrect, handleWrong, loadNext, startMs]);

  const handleEasyChange = useCallback((e) => {
    const v = e.target.value;
    if (!startMs) setStartMs(Date.now());
    if (v.endsWith(' ') || v.endsWith('\n')) submitEasy(v);
    else setInp(v);
  }, [submitEasy, startMs]);

  /* Medium mode handlers */
  const handleMediumChange = useCallback((e) => {
    if (!startMs) setStartMs(Date.now());
    setInp(e.target.value);
  }, [startMs]);

  const handleMediumKey = useCallback((e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const typed = inp.trim(); if (!typed) return;
    if (typed === current.trim()) {
      handleCorrect(typed.length);
      setTimeout(() => setQueue(q => loadNext(q, 'medium')), 100);
    } else {
      handleWrong(typed, current);
      setTimeout(() => setQueue(q => loadNext(q, 'medium')), 400);
    }
  }, [inp, current, handleCorrect, handleWrong, loadNext]);

  /* Hard mode handlers */
  const handleHardChange = useCallback((e) => {
    const v = e.target.value;
    if (!startMs) setStartMs(Date.now());
    setInp(v);
    if (v === current) {
      handleCorrect(v.length);
      setTimeout(() => setQueue(q => loadNext(q, 'hard')), 150);
    }
  }, [current, handleCorrect, loadNext, startMs]);

  const handleHardKey = useCallback((e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const typed = inp.trim(); if (!typed) return;
    if (typed !== current.trim()) {
      handleWrong(typed, current);
      setTimeout(() => setQueue(q => loadNext(q, 'hard')), 400);
    }
  }, [inp, current, handleWrong, loadNext]);

  /* Derived values */
  const elapsed   = startMs ? Math.max((Date.now() - startMs) / 60000, 0.01) : 0.01;
  const liveWpm   = correct > 0 ? Math.round(correct / elapsed) : 0;
  const acc       = totalT  > 0 ? Math.round((correct / totalT) * 100) : 100;
  const cfg       = lvl ? LCFG[lvl] : null;
  const timerPct  = cfg ? Math.max(0, (tLeft / cfg.time) * 100) : 100;
  const timerColor= tLeft > 10 ? 'var(--correct)' : tLeft > 5 ? 'var(--warn)' : 'var(--wrong)';
  const timerCls  = tLeft > 10 ? 'tok' : tLeft > 5 ? 'twarn' : 'tlow';
  const finalWpm  = correct > 0 && startMs ? Math.round(correct / elapsed) : 0;

  /* Character renderer */
  const renderChars = useCallback((text, userInp) =>
    text.split('').map((ch, i) => {
      let c = 'pending';
      if (i < userInp.length) c = userInp[i] === ch ? 'correct' : 'wrong';
      else if (i === userInp.length) c = 'current';
      return <span key={i} className={`wc ${c}`}>{ch}</span>;
    })
  , []);

  /* ── SCREEN: START ── */
  if (screen === 'start') {
    return (
      <div className="wrap">
        <div className="screen-start">
          {/* Header */}
          <header className="hdr">
            <div className="logo">FAST TYPER</div>
            <ThemeBtn dark={dark} setDark={setDark} />
          </header>

          {/* Subtitle */}
          <p className="start-sub">Select your difficulty</p>

          {/* Level cards */}
          <div className="level-grid">
            {['easy', 'medium', 'hard'].map(l => {
              const c   = LCFG[l];
              const sel = selLvl === l;
              const icons = { easy: '✦', medium: '◈', hard: '◉' };
              return (
                <div
                  key={l}
                  className={`lcard ${l}${sel ? ' sel' : ''}`}
                  onClick={() => setSelLvl(l)}
                  role="button"
                  aria-pressed={sel}
                  tabIndex={0}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSelLvl(l)}
                >
                  <div className="check">{sel ? '✓' : ''}</div>
                  <div className="lc-icon">{icons[l]}</div>
                  <div className="lc-name">{c.label}</div>
                  <div className="lc-desc">{c.desc}</div>
                  <div className="lc-time">{c.tl}</div>
                </div>
              );
            })}
          </div>

          {/* Start button */}
          <button
            className={`btn-go${selLvl ? ' rdy' : ''}`}
            onClick={startGame}
            disabled={!selLvl}
          >
            START GAME
          </button>

          {/* How to play */}
          <div className="how">
            <h3>How to play</h3>
            <ul>
              <li>Easy: type 3-letter words → press <strong>Space</strong> to submit</li>
              <li>Medium: type full sentences → press <strong>Enter</strong> to submit</li>
              <li>Hard: type full paragraphs → press <strong>Enter</strong> when done</li>
              <li>Wrong answer shows an error with the correct text</li>
              <li>Reach your streak goal to earn bonus seconds</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  /* ── SCREEN: GAME OVER ── */
  if (screen === 'over') {
    const rank = getRank(finalWpm, lvl);
    return (
      <div className="wrap wide-wrap">
        <div className="screen-over">

          {/* Three-column header: [blank] [GAME OVER] [blank] */}
          <header className="hdr over-hdr">
            <div className="over-hdr-side" />
            <h1 className="over-t">GAME OVER</h1>
            <div className="over-hdr-side over-hdr-right">
            </div>
          </header>

          {/* Subtitle & rank */}
          <p className="over-s">{LCFG[lvl].label} Mode · Your Results</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div
              className="rank-pill"
              style={{ color: rank.c, borderColor: rank.c, background: rank.c + '18' }}
            >
              {rank.l}
            </div>
            <ThemeBtn dark={dark} setDark={setDark} />
          </div>

          {/* Stats cards */}
          <div className="res-grid">
            <div className="rc hi">
              <div className="rl">WPM</div>
              <div className="rv">{finalWpm}</div>
              <div className="rs">words / min</div>
            </div>
            <div className="rc">
              <div className="rl">Accuracy</div>
              <div className="rv">{acc}%</div>
              <div className="rs">{correct} correct</div>
            </div>
            <div className="rc">
              <div className="rl">{lvl === 'easy' ? 'Words' : lvl === 'medium' ? 'Sentences' : 'Paragraphs'}</div>
              <div className="rv">{correct}</div>
              <div className="rs">{incorrect} missed</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="btns">
            <button className="br" onClick={startGame}>PLAY AGAIN</button>
            <button className="br sec" onClick={() => { setScreen('start'); setSelLvl(null); }}>
              CHANGE LEVEL
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── SCREEN: GAME ── */
  const isEasy = lvl === 'easy', isMed = lvl === 'medium', isHard = lvl === 'hard';
  const dispCls = isEasy ? 'word-disp' : isMed ? 'sent-disp' : 'para-disp';
  const sg = cfg.sg;

  return (
    <div className="wrap">
      <div className="screen-game">

        {/* Header */}
        <header className="hdr">
          <div className="logo" style={{ fontSize: 'clamp(18px,4vw,26px)' }}>FAST TYPER</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="theme-btn"
              onClick={() => { setScreen('start'); setSelLvl(null); }}
              title="Return to main menu"
            >
              ✕ Cancel
            </button>
            <ThemeBtn dark={dark} setDark={setDark} />
          </div>
        </header>

        {/* Timer bar */}
        <div className="top-bar">
          <div className="sbox">
            <div className="slbl">Score</div>
            <div className="sval">{correct}</div>
          </div>
          <div className="tbar-wrap">
            <div className="tbar-fill" style={{ width: `${timerPct}%`, background: timerColor }} />
          </div>
          <div className="sbox">
            <div className="slbl">Time</div>
            <div className={`sval ${timerCls}`}>{tLeft.toFixed(1)}s</div>
          </div>
        </div>

        {/* Level badge + streak */}
        <div className="meta-row">
          <div className={`lvl-badge b${lvl[0]}`}>{cfg.label} mode</div>
          <div className="streak-row">
            {Array.from({ length: sg }, (_, i) => (
              <div key={i} className={`pip${(streak % sg) > i ? ' on' : ''}`} />
            ))}
            <span className="stxt">{streak > 0 ? `${streak} streak` : 'streak'}</span>
          </div>
        </div>

        {/* Wrong message */}
        {wrongInfo && (
          <WrongMsg typed={wrongInfo.typed} expected={wrongInfo.expected} level={lvl} />
        )}

        {/* Bonus notification */}
        {showBonus && (
          <div className="bonus-bar show">{`+${cfg.bs}s — ${bonusMsg}`}</div>
        )}

        {/* Word / sentence / paragraph display */}
        <div className="word-box">
          <div className={dispCls}>{renderChars(current, inp)}</div>
          <div className="type-hint">
            {isEasy  ? 'type the word · space to submit'
           : isMed   ? 'type the sentence · enter to submit'
           :           'type the paragraph · enter when done'}
          </div>
        </div>

        {/* Input */}
        <div className="input-wrap">
          {isHard
            ? <textarea
                ref={inpR}
                className={`wi wi-para ${inpState !== 'idle' ? inpState : ''} ${shake ? 'shake' : ''}`}
                value={inp}
                onChange={handleHardChange}
                onKeyDown={handleHardKey}
                placeholder="Start typing the paragraph here..."
                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              />
            : <input
                ref={inpR}
                className={`wi ${inpState !== 'idle' ? inpState : ''} ${shake ? 'shake' : ''}`}
                value={inp}
                onChange={isEasy ? handleEasyChange : handleMediumChange}
                onKeyDown={isMed ? handleMediumKey : undefined}
                placeholder={isEasy ? 'type here…' : 'Type and press Enter…'}
                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              />
          }
        </div>

        {/* Live stats */}
        <div className="stats-row">
          <div className="mini">
            <div className="ml">WPM</div>
            <div className={`mv${liveWpm > 0 ? ' g' : ''}`}>{liveWpm}</div>
          </div>
          <div className="mini">
            <div className="ml">Accuracy</div>
            <div className={`mv${acc >= 80 ? ' g' : acc >= 60 ? ' y' : ' r'}`}>{acc}%</div>
          </div>
          <div className="mini">
            <div className="ml">Streak</div>
            <div className={`mv${streak >= 3 ? ' g' : ''}`}>{streak}</div>
          </div>
          <div className="mini">
            <div className="ml">{isEasy ? 'Words' : isMed ? 'Sent.' : 'Para.'}</div>
            <div className="mv">{totalT}</div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
