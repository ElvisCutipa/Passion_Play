import { useState, useEffect } from 'react'
import './App.css'

type Level = {
  id: string
  title: string
  subtitle: string
  symbol: string
  points: number
  isVip?: boolean
}

type CardType = 'pregunta' | 'verdad_penitencia' | 'tiempo' | 'doble'

type Card = {
  title: string
  prompt: string
  type: CardType
  duration?: number
  penalty?: string
}

type Theme = 'pasion' | 'atardecer' | 'cyber'

const levels: Level[] = [
  { id: 'romantico', title: 'Romántico', subtitle: 'Conexión y ternura', symbol: '♥', points: 0 },
  { id: 'coqueto', title: 'Coqueto', subtitle: 'Miradas y chispa', symbol: '✦', points: 20 },
  { id: 'atrevido', title: 'Atrevido', subtitle: 'Sube la temperatura', symbol: '♨', points: 50 },
  { id: 'intenso', title: 'Sin filtros', subtitle: 'Fantasías y secretos', symbol: '✹', points: 100 },
  { id: 'aniversario', title: 'Especial Aniversario', subtitle: 'Recuerdos e historia juntos', symbol: '👑', points: 0, isVip: true },
  { id: 'fantasias', title: 'Juegos de Rol', subtitle: 'Fantasías y escenarios', symbol: '🎭', points: 0, isVip: true },
]

const penaltiesByLevel: Record<string, string[]> = {
  romantico: [
    'Dale un abrazo apretado de 30 segundos sin hablar.',
    'Dale 3 besos suaves en la mejilla o frente.',
    'Dile tres cosas que te encantan de su mirada.',
    'Hazle un masaje suave de 1 minuto en las manos o cuello.',
  ],
  coqueto: [
    'Mírense a los ojos a 10 cm durante 15 segundos sin morderse los labios.',
    'Dale un beso a ciegas en el lugar que tu pareja elija.',
    'Hazle una caricia sensual en la nuca durante 30 segundos.',
  ],
  atrevido: [
    'Dale 3 besos apasionados en el cuello.',
    'Susúrrale al oído una frase provocativa.',
    'Acaricia suavemente el muslo o cintura de tu pareja durante 30 segundos.',
  ],
  intenso: [
    'Describe en voz baja un escenario íntimo que quieras probar.',
    'Dale un beso apasionado de 10 segundos donde tú decidas.',
    'Susúrrale un secreto o fantasía que nunca le hayas contado a nadie.',
  ],
  aniversario: [
    'Regálale un masaje de pies de 2 minutos mientras conversan.',
    'Dile un compromiso especial que asumes para su relación este mes.',
  ],
  fantasias: [
    'Adopta la postura o rol de liderazgo que tu pareja ordene por 1 minuto.',
    'Susúrrale la instrucción de tu rol fantástico favorito.',
  ]
}

const deck: Record<string, Card[]> = {
  romantico: [
    { title: 'El detalle invisible', prompt: 'Dile a tu pareja qué pequeño detalle diario suyo te enamora en secreto.', type: 'pregunta' },
    { title: 'Verdad o Penitencia', prompt: '¿Cuál fue el momento exacto en el que supiste que te estabas enamorando?', type: 'verdad_penitencia' },
    { title: 'Mirada fija (30s)', prompt: 'Mírense a los ojos sin hablar durante 30 segundos. ¡El primero en reírse paga penitencia!', type: 'tiempo', duration: 30 },
  ],
  coqueto: [
    { title: 'Efecto imán', prompt: '¿Qué gesto o expresión de tu pareja hace que pierdas la concentración?', type: 'pregunta' },
    { title: 'Tensión de 10s', prompt: 'Mírense a los ojos a 10 cm de distancia durante 10 segundos sin reírse.', type: 'tiempo', duration: 10 },
  ],
  atrevido: [
    { title: 'Propuesta indecorosa', prompt: 'Haz una propuesta picante para su próxima intimidad. ¿Acepta o paga penitencia?', type: 'pregunta' },
    { title: 'Doble o Nada (+30 PTS)', prompt: 'Los dos deben confesar una fantasía ligera al mismo tiempo.', type: 'doble' },
  ],
  intenso: [
    { title: 'El límite sagrado', prompt: 'Conversen abiertamente sobre un nuevo límite que les gustaría explorar.', type: 'pregunta' },
    { title: 'Verdad Extreme', prompt: 'Describe detalladamente un escenario íntimo y salvaje que quieras probar.', type: 'verdad_penitencia' },
  ],
  aniversario: [
    { title: 'Punto de inflexión', prompt: '¿Cuál ha sido el obstáculo superado juntos que más los ha unido como pareja?', type: 'pregunta' },
    { title: 'Promesa de futuro', prompt: 'Expresa un sueño conjunto que te comprometes a hacer realidad este año.', type: 'pregunta' },
  ],
  fantasias: [
    { title: 'Juego de Roles', prompt: 'Propón un personaje o rol para actuar durante los próximos 5 minutos.', type: 'pregunta' },
    { title: 'Escenario de Riesgo', prompt: 'Describe un lugar fuera de lo común donde te encantaría llevar a tu pareja.', type: 'pregunta' },
  ]
}

// Audio Sintético NAtivo
let globalAudioCtx: AudioContext | null = null

function getAudioContext() {
  if (!globalAudioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext
    if (AudioCtx) globalAudioCtx = new AudioCtx()
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume()
  }
  return globalAudioCtx
}

function playSound(type: 'click' | 'win' | 'timer_end') {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    if (type === 'click') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.08)
    } else if (type === 'win') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08)
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + idx * 0.08)
        osc.stop(ctx.currentTime + idx * 0.08 + 0.3)
      })
    } else if (type === 'timer_end') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.4)
    }
  } catch (e) { console.error(e) }
}

function triggerVibration(pattern: number | number[]) {
  if ('vibrate' in navigator) navigator.vibrate(pattern)
}

function App() {
  // Persistencia de Puntos e Historial
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem('passion_play_points')
    return saved ? parseInt(saved, 10) : 0
  })

  const [isVipUnlocked, setIsVipUnlocked] = useState(() => {
    return localStorage.getItem('passion_play_vip') === 'true'
  })

  // Nombres de la pareja
  const [player1, setPlayer1] = useState(() => localStorage.getItem('passion_p1') || 'Él')
  const [player2, setPlayer2] = useState(() => localStorage.getItem('passion_p2') || 'Ella')
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1)
  const [showNameModal, setShowNameModal] = useState(false)

  // Métricas de Sesión
  const [completedCount, setCompletedCount] = useState(0)
  const [penaltiesCount, setPenaltiesCount] = useState(0)
  const [showSummaryModal, setShowSummaryModal] = useState(false)

  // Temas visuales
  const [theme, setTheme] = useState<Theme>('pasion')

  const [levelId, setLevelId] = useState('romantico')
  const [cardIndex, setCardIndex] = useState(0)
  const [usedIndices, setUsedIndices] = useState<Record<string, number[]>>({ romantico: [], coqueto: [], atrevido: [], intenso: [], aniversario: [], fantasias: [] })

  const [showCard, setShowCard] = useState(false)
  const [showRoulette, setShowRoulette] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showVipModal, setShowVipModal] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  const [activePenalty, setActivePenalty] = useState<string | null>(null)
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  const [spinning, setSpinning] = useState(false)
  const [rouletteResult, setRouletteResult] = useState<Card | null>(null)
  const [mode, setMode] = useState<'local' | 'online'>('local')

  const level = levels.find((item) => item.id === levelId) ?? levels[0]
  const cards = deck[levelId] ?? deck.romantico
  const card = cards[cardIndex % cards.length]

  const isUnlocked = (item: Level) => item.isVip ? isVipUnlocked : points >= item.points

  useEffect(() => { localStorage.setItem('passion_play_points', points.toString()) }, [points])
  useEffect(() => { localStorage.setItem('passion_play_vip', isVipUnlocked.toString()) }, [isVipUnlocked])
  useEffect(() => {
    localStorage.setItem('passion_p1', player1)
    localStorage.setItem('passion_p2', player2)
  }, [player1, player2])

 // Temporizador corregido para TypeScript y Navegador
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    if (isTimerRunning && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => { setTimerSeconds((prev) => (prev !== null ? prev - 1 : 0)) }, 1000)
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false)
      playSound('timer_end')
      triggerVibration([200, 100, 200])
    }
    return () => { if (interval) clearInterval(interval) }
  }, [isTimerRunning, timerSeconds])
  function selectLevel(item: Level) {
    if (!isUnlocked(item)) {
      if (item.isVip) setShowVipModal(true)
      return
    }
    playSound('click')
    setLevelId(item.id)
    setCardIndex(0)
    setRouletteResult(null)
    setActivePenalty(null)
    setIsFlipped(false)
  }

  function getUniqueRandomIndex(currentLevelId: string): number {
    const totalCards = deck[currentLevelId].length
    const currentUsed = usedIndices[currentLevelId] || []
    if (currentUsed.length >= totalCards) {
      setUsedIndices((prev) => ({ ...prev, [currentLevelId]: [] }))
      return Math.floor(Math.random() * totalCards)
    }
    let availableIndices = []
    for (let i = 0; i < totalCards; i++) {
      if (!currentUsed.includes(i)) availableIndices.push(i)
    }
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
    setUsedIndices((prev) => ({ ...prev, [currentLevelId]: [...(prev[currentLevelId] || []), randomIndex] }))
    return randomIndex
  }

  function spinRoulette() {
    if (spinning) return
    setSpinning(true)
    setRouletteResult(null)
    setActivePenalty(null)
    setIsFlipped(false)

    let tickCount = 0
    const tickInterval = setInterval(() => {
      playSound('click')
      triggerVibration(15)
      tickCount++
      if (tickCount > 12) clearInterval(tickInterval)
    }, 180)

    window.setTimeout(() => {
      clearInterval(tickInterval)
      const newIndex = getUniqueRandomIndex(levelId)
      const selectedCard = cards[newIndex]
      setCardIndex(newIndex)
      setRouletteResult(selectedCard)
      setSpinning(false)
      playSound('win')
      triggerVibration([50, 50, 100])
      setPoints((currentPoints) => currentPoints + (selectedCard.type === 'doble' ? 30 : 15))
    }, 2500)
  }

  function completeChallenge() {
    playSound('click')
    setCompletedCount((prev) => prev + 1)
    toggleTurn()
    nextCard()
  }

  function toggleTurn() {
    setCurrentTurn((prev) => (prev === 1 ? 2 : 1))
  }

  function nextCard() {
    const newIndex = getUniqueRandomIndex(levelId)
    setCardIndex(newIndex)
    setActivePenalty(null)
    setIsFlipped(false)
    setIsTimerRunning(false)
    setTimerSeconds(null)
    const nextCardItem = cards[newIndex]
    setPoints((currentPoints) => currentPoints + (nextCardItem.type === 'doble' ? 20 : 10))
  }

  function triggerLevelPenalty() {
    playSound('click')
    triggerVibration(50)
    setPenaltiesCount((prev) => prev + 1)
    const levelPenalties = penaltiesByLevel[levelId] || penaltiesByLevel.romantico
    const randomPen = levelPenalties[Math.floor(Math.random() * levelPenalties.length)]
    setActivePenalty(randomPen)
  }

  function startTimer(duration: number) {
    playSound('click')
    setTimerSeconds(duration)
    setIsTimerRunning(true)
  }

  function closeRoulette() {
    if (spinning) return
    playSound('click')
    setShowRoulette(false)
    setRouletteResult(null)
  }

  function unlockVipSimulated() {
    playSound('win')
    setIsVipUnlocked(true)
    setShowVipModal(false)
  }

  function renderCardBadge(type: CardType) {
    switch (type) {
      case 'verdad_penitencia': return <span className="card-badge penalty-badge">🔥 VERDAD O PENITENCIA</span>
      case 'tiempo': return <span className="card-badge time-badge">⏱ RETO DE TIEMPO</span>
      case 'doble': return <span className="card-badge double-badge">✨ DOBLE O NADA (+30 PTS)</span>
      default: return <span className="card-badge standard-badge">♥ RETO DIRECTO</span>
    }
  }

  const activePlayerName = currentTurn === 1 ? player1 : player2

  return (
    <main className={`app-shell theme-${theme}`}>
      {/* HEADER */}
      <header className="topbar">
        <div className="brand-mark">P<span>✦</span></div>
        <div className="brand-copy">
          <strong>PASSION <em>PLAY</em></strong>
          <small>PAREJA: {player1} & {player2}</small>
        </div>
        <div className="topbar-actions">
          <button className="icon-btn" onClick={() => { playSound('click'); setShowNameModal(true); }}>👥</button>
          <button className="profile-dot" onClick={() => { playSound('click'); setShowInfo(true); }}>?</button>
        </div>
      </header>

      {/* SELECTOR DE TEMAS */}
      <div className="theme-selector">
        <button className={theme === 'pasion' ? 'active' : ''} onClick={() => setTheme('pasion')}>🍷 Pasión</button>
        <button className={theme === 'atardecer' ? 'active' : ''} onClick={() => setTheme('atardecer')}>🌅 Dorado</button>
        <button className={theme === 'cyber' ? 'active' : ''} onClick={() => setTheme('cyber')}>⚡ Cyber</button>
      </div>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="eyebrow">
          <span className="live-dot" /> TURNO ACTUAL: <strong className="player-highlight">{activePlayerName.toUpperCase()}</strong>
        </div>
        <h1>Una chispa.<br /><span>Mil posibilidades.</span></h1>
        <p>Acepten retos, respondan verdades o cumplan penitencias juntos.</p>
        <div className="hero-orb">
          <div className="orb-inner">♥</div>
          <span className="orb-spark s1">✦</span>
          <span className="orb-spark s2">✧</span>
        </div>
      </section>

      {/* ESTADÍSTICAS */}
      <section className="stats-row">
        <div className="stat-card">
          <span className="stat-label">PUNTOS TOTALES</span>
          <strong>{points}</strong>
          <small>pts acumulados</small>
        </div>
        <div className="stat-card">
          <span className="stat-label">TURNO DE</span>
          <strong>{activePlayerName}</strong>
          <small>haz clic para cambiar</small>
        </div>
      </section>

      {/* NIVELES Y VIP */}
      <section className="section-head">
        <div>
          <span className="section-kicker">ELIGE TU VIBRA</span>
          <h2>Modos de juego</h2>
        </div>
        {!isVipUnlocked && <button className="vip-badge-btn" onClick={() => setShowVipModal(true)}>👑 DESBLOQUEAR VIP</button>}
      </section>

      <section className="levels-grid">
        {levels.map((item, index) => {
          const unlocked = isUnlocked(item)
          return (
            <button
              key={item.id}
              className={`level-card ${item.id} ${levelId === item.id ? 'selected' : ''} ${!unlocked ? 'locked' : ''}`}
              onClick={() => selectLevel(item)}
            >
              <div className="level-top">
                <span className="level-icon">{item.symbol}</span>
                {!unlocked && <span className="lock-icon">{item.isVip ? '👑' : '🔒'}</span>}
              </div>
              <strong>{item.title}</strong>
              <small>{item.subtitle}</small>
              <div className="level-bottom">
                <span>
                  {!unlocked
                    ? (item.isVip ? 'MODO VIP' : `${item.points} PTS PARA ABRIR`)
                    : levelId === item.id ? 'SELECCIONADO' : 'JUGAR'}
                </span>
                <span>0{index + 1}</span>
              </div>
            </button>
          )
        })}
      </section>

      {/* MODOS */}
      <div className="mode-switch">
        <button className={mode === 'local' ? 'active' : ''} onClick={() => { playSound('click'); setMode('local'); }}>
          <span>▣</span><strong>Un celular</strong><small>Jueguen juntos</small>
        </button>
        <button className={mode === 'online' ? 'active' : ''} onClick={() => { playSound('click'); setMode('online'); }}>
          <span>⌁</span><strong>Dos celulares</strong><small>Modo en línea</small>
        </button>
      </div>

      {/* BOTÓN PRINCIPAL */}
      <button
        className="primary-cta"
        onClick={() => {
          playSound('click')
          setShowRoulette(true)
          setRouletteResult(null)
          setActivePenalty(null)
        }}
      >
        ♥ &nbsp; GIRAR RULETA DE {activePlayerName.toUpperCase()} &nbsp; ✦
      </button>

      <button className="summary-btn" onClick={() => setShowSummaryModal(true)}>
        📊 Ver Resumen de la Cita
      </button>

      <footer>
        <span>PASSION PLAY © 2026</span>
        <span>SUITE PROFESIONAL COMPLETA</span>
      </footer>

      {/* MODAL CONFIGURACIÓN DE NOMBRES */}
      {showNameModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowNameModal(false)}>×</button>
            <h2>Configurar Pareja 👥</h2>
            <div className="input-group">
              <label>Nombre Jugador 1:</label>
              <input type="text" value={player1} onChange={(e) => setPlayer1(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Nombre Jugador 2:</label>
              <input type="text" value={player2} onChange={(e) => setPlayer2(e.target.value)} />
            </div>
            <button className="next-button" onClick={() => { playSound('click'); setShowNameModal(false); }}>
              GUARDAR NOMBRES ✦
            </button>
          </div>
        </div>
      )}

      {/* MODAL VIP */}
      {showVipModal && (
        <div className="modal-backdrop">
          <div className="modal-content vip-modal">
            <button className="modal-close" onClick={() => setShowVipModal(false)}>×</button>
            <div className="brand-mark big-mark">👑</div>
            <h2>Edición VIP Pasión</h2>
            <p>Accede inmediatamente a los paquetes exclusivos de <strong>Especial Aniversario</strong> y <strong>Juegos de Rol & Fantasías</strong>.</p>
            <button className="next-button vip-btn" onClick={unlockVipSimulated}>
              ✨ DESBLOQUEAR AHORA (GRATIS DEMO)
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE RULETA */}
      {showRoulette && (
        <div className="modal-backdrop">
          <div className="modal-content roulette-modal">
            <button className="modal-close" onClick={closeRoulette} disabled={spinning}>×</button>
            <span className="section-kicker">PASSION PLAY · TURNO DE {activePlayerName.toUpperCase()}</span>
            <h2>¿Qué desafío le toca a {activePlayerName}?</h2>

            <div className={`roulette-wheel ${spinning ? 'spinning' : ''}`}>
              <div className="roulette-center">♥</div>
              <span className="roulette-star star-one">✦</span>
              <span className="roulette-star star-two">✧</span>
              <span className="roulette-star star-three">♥</span>
            </div>

            <p className="roulette-level">NIVEL: {level.title.toUpperCase()}</p>
            {spinning && <p className="spinning-message">Girando el destino de su conexión...</p>}

            {rouletteResult && !spinning && (
              <div className="roulette-result">
                {renderCardBadge(rouletteResult.type)}
                <h3>{rouletteResult.title}</h3>
                <p>{rouletteResult.prompt}</p>
                <button className="next-button" onClick={() => { playSound('click'); setShowRoulette(false); setShowCard(true); }}>
                  ABRIR TARJETA 3D ✦
                </button>
              </div>
            )}

            <button className="next-button" disabled={spinning} onClick={spinRoulette}>
              {spinning ? 'GIRANDO...' : 'GIRAR LA RULETA ✦'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL TARJETA 3D */}
      {showCard && (
        <div className="modal-backdrop">
          <div className="modal-content card-modal-3d">
            <button className="modal-close" onClick={() => { playSound('click'); setShowCard(false); setActivePenalty(null); setIsFlipped(false); }}>×</button>

            <div className={`flip-card-container ${isFlipped ? 'flipped' : ''}`} onClick={() => { if (!isFlipped) { playSound('click'); triggerVibration(30); setIsFlipped(true); } }}>
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <div className="brand-mark big-mark">P<span>✦</span></div>
                  <h3>TURNO DE {activePlayerName.toUpperCase()}</h3>
                  <p>Toca para revelar el reto</p>
                  <span className="flip-hint">✦ ✦ ✦</span>
                </div>

                <div className="flip-card-back">
                  {renderCardBadge(card.type)}
                  <h2>{card.title}</h2>
                  <p>{card.prompt}</p>

                  {card.duration && (
                    <div className="timer-box">
                      {timerSeconds === null ? (
                        <button className="timer-btn" onClick={() => startTimer(card.duration!)}>⏱ Iniciar Tiempo ({card.duration}s)</button>
                      ) : (
                        <div className="timer-display">
                          <span className="timer-number">{timerSeconds}s</span>
                          <span className="timer-status">{isTimerRunning ? '¡En marcha!' : '¡Tiempo terminado! 🎉'}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {activePenalty && (
                    <div className="penalty-box">
                      <span className="penalty-title">😈 PENITENCIA PARA {activePlayerName.toUpperCase()}</span>
                      <p>{activePenalty}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card-footer">
              <span>NIVEL {level.title.toUpperCase()}</span>
              <span>TURNO: {activePlayerName}</span>
            </div>

            {isFlipped && (
              <>
                <button className="next-button" onClick={completeChallenge}>
                  ¡COMPLETADO POR {activePlayerName.toUpperCase()}! ✦
                </button>

                {!activePenalty ? (
                  <button className="pass-button penalty-btn" onClick={triggerLevelPenalty}>
                    😈 No sé qué decir / Ver Penitencia
                  </button>
                ) : (
                  <button className="pass-button" onClick={nextCard}>Siguiente Reto ✦</button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL RESUMEN */}
      {showSummaryModal && (
        <div className="modal-backdrop">
          <div className="modal-content info-content">
            <button className="modal-close" onClick={() => setShowSummaryModal(false)}>×</button>
            <div className="brand-mark big-mark">📊</div>
            <h2>Resumen de la Cita</h2>
            <div className="summary-stats">
              <div className="summary-item"><strong>{completedCount}</strong><span>Retos Completados</span></div>
              <div className="summary-item"><strong>{penaltiesCount}</strong><span>Penitencias Cumplidas</span></div>
              <div className="summary-item"><strong>{points}</strong><span>Puntos de Conexión</span></div>
            </div>
            <p className="summary-badge">🥇 NIVEL DE COMPLICIDAD: <strong>MÁXIMA PASIÓN</strong></p>
            <button className="next-button" onClick={() => setShowSummaryModal(false)}>CONTINUAR JUGANDO</button>
          </div>
        </div>
      )}

      {/* INFORMACIÓN */}
      {showInfo && (
        <div className="modal-backdrop">
          <div className="modal-content info-content">
            <button className="modal-close" onClick={() => setShowInfo(false)}>×</button>
            <div className="brand-mark big-mark">P<span>✦</span></div>
            <h2>PASSION PLAY PRO</h2>
            <p>Aplicación completa para parejas con turnos inteligentes, audio sintético, cambio de temas visuales y modos VIP.</p>
            <button className="next-button" onClick={() => setShowInfo(false)}>¡ENTENDIDO!</button>
          </div>
        </div>
      )}
    </main>
  )
}

export default App