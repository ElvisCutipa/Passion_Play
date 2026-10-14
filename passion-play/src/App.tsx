import { useState, useEffect } from 'react'
import './App.css'

type Level = {
  id: string
  title: string
  subtitle: string
  symbol: string
  points: number
}

type CardType = 'pregunta' | 'verdad_penitencia' | 'tiempo' | 'doble'

type Card = {
  title: string
  prompt: string
  type: CardType
  duration?: number
  penalty?: string
}

const levels: Level[] = [
  {
    id: 'romantico',
    title: 'Romántico',
    subtitle: 'Conexión, ternura y complicidad',
    symbol: '♥',
    points: 0,
  },
  {
    id: 'coqueto',
    title: 'Coqueto',
    subtitle: 'Miradas, chispa y juego suave',
    symbol: '✦',
    points: 20,
  },
  {
    id: 'atrevido',
    title: 'Atrevido',
    subtitle: 'Sube la temperatura y la tensión',
    symbol: '♨',
    points: 50,
  },
  {
    id: 'intenso',
    title: 'Sin filtros',
    subtitle: 'Fantasías, deseos y secretos profundos',
    symbol: '✹',
    points: 100,
  },
]

const penaltiesByLevel: Record<string, string[]> = {
  romantico: [
    'Dale un abrazo apretado de 30 segundos sin hablar.',
    'Dale 3 besos suaves en la mejilla o frente.',
    'Dile tres cosas que te encantan de su mirada.',
    'Hazle un masaje suave de 1 minuto en las manos o cuello.',
    'Susúrrale un piropo o agradecimiento cariñoso al oído.',
    'Prepara una taza de agua/café o tráele un snack para más tarde.'
  ],
  coqueto: [
    'Mírense a los ojos a 10 cm de distancia durante 15 segundos sin morderse los labios.',
    'Dale un beso a ciegas en el lugar del rostro que tu pareja elija.',
    'Hazle una caricia sensual en la nuca durante 30 segundos.',
    'Dile qué prenda de vestir suya es tu favorita y por qué.',
    'Susúrrale al oído una confesión coqueta con voz pausada.',
    'Imita la forma en que tu pareja te coquetea cuando quiere algo.'
  ],
  atrevido: [
    'Dale 3 besos apasionados en el cuello.',
    'Susúrrale al oído una frase muy provocativa y atrevida.',
    'Acaricia suavemente el muslo o cintura de tu pareja durante 30 segundos.',
    'Hazle un masaje express de 1 minuto en la espalda con ritmo pausado.',
    'Adivina con los ojos cerrados qué parte del cuerpo te está rozando tu pareja.',
    'Concédele a tu pareja un deseo juguetón para cumplir esta noche.'
  ],
  intenso: [
    'Describe en voz baja un escenario íntimo y salvaje que quieras probar.',
    'Dale un beso apasionado de 10 segundos donde tú decidas.',
    'Susúrrale un secreto o fantasía que nunca le hayas contado a nadie.',
    'Concédele un deseo erótico o pídele una promesa íntima para más tarde.',
    'Quítale suavemente una prenda a tu pareja con una sola mano.',
    'Pasa tu mano suavemente por donde tu pareja te indique durante 20 segundos.'
  ]
}

const deck: Record<string, Card[]> = {
  romantico: [
    { title: 'El detalle invisible', prompt: 'Dile a tu pareja qué pequeño detalle o hábito diario suyo te enamora en secreto.', type: 'pregunta' },
    { title: 'Verdad o Penitencia', prompt: '¿Cuál fue el momento exacto en el que dijiste "me estoy enamorando"? Si no recuerdas o pasas, ¡penitencia!', type: 'verdad_penitencia' },
    { title: 'Mirada fija (30s)', prompt: 'Mírense fijamente a los ojos sin hablar durante 30 segundos. El primero en reírse cumple penitencia.', type: 'tiempo', duration: 30 },
    { title: 'Melodía compartida', prompt: 'Si nuestra relación tuviera una canción oficial en este momento, ¿cuál sería y por qué?', type: 'pregunta' },
    { title: 'Futuro en miniatura', prompt: 'Imaginen un domingo perfecto dentro de cinco años. ¿Cómo empieza el día?', type: 'pregunta' },
    { title: 'Doble o Nada (30 PTS)', prompt: 'Ambos deben decir al mismo tiempo: ¿cuál es la comida favorita del otro? Si fallan, pagan penitencia.', type: 'doble' },
  ],

  coqueto: [
    { title: 'Efecto imán', prompt: '¿Qué gesto o expresión de tu pareja es tu debilidad absoluta y hace que pierdas la concentración?', type: 'pregunta' },
    { title: 'Verdad o Penitencia', prompt: 'Confiesa qué prenda de tu pareja te enciende más cuando se la pone. ¿Te da vergüenza?', type: 'verdad_penitencia' },
    { title: 'Tensión de 10 segundos', prompt: 'Mírense fijamente a los ojos a 10 cm de distancia durante 10 segundos sin reírse.', type: 'tiempo', duration: 10 },
    { title: 'Cumplido prohibido', prompt: 'Dile un cumplido atrevido sobre su físico que nunca antes le habías dicho en voz alta.', type: 'pregunta' },
    { title: 'Doble o Nada (30 PTS)', prompt: 'Recreen la primera vez que se coquetearon durante 20 segundos.', type: 'doble', duration: 20 },
  ],

  atrevido: [
    { title: 'Propuesta indecorosa', prompt: 'Haz una propuesta picante para su próxima intimidad. Tu pareja puede aceptarla, negociarla o pasar.', type: 'pregunta' },
    { title: 'Verdad o Penitencia', prompt: 'Confiesa cuál es la zona de tu cuerpo que más te excita que te toquen con suavidad. ¿Guardas silencio?', type: 'verdad_penitencia' },
    { title: 'Recuerdo febril', prompt: 'Comparte un recuerdo íntimo y apasionado que hayas revivido mentalmente esta semana.', type: 'pregunta' },
    { title: 'Doble o Nada (30 PTS)', prompt: 'Los dos deben confesar una fantasía ligera al mismo tiempo.', type: 'doble' },
  ],

  intenso: [
    { title: 'El límite sagrado', prompt: 'Conversen abiertamente sobre un nuevo límite que les gustaría explorar o proteger con total confianza.', type: 'pregunta' },
    { title: 'Verdad o Penitencia Extreme', prompt: 'Describe detalladamente un escenario íntimo y salvaje que te encantaría materializar juntos.', type: 'verdad_penitencia' },
    { title: 'Desnudez mental', prompt: 'Comparte algo vulnerable sobre tus inseguridades en la intimidad y cómo tu pareja te ayuda.', type: 'pregunta' },
    { title: 'Doble o Nada (30 PTS)', prompt: 'Inventen en 30 segundos un reto consensuado para cumplir esta noche. (+30 pts)', type: 'doble', duration: 30 },
  ],
}

// Variable global para compartir el contexto de audio y evitar que el navegador lo bloquee
let globalAudioCtx: AudioContext | null = null

function getAudioContext() {
  if (!globalAudioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext
    if (AudioCtx) {
      globalAudioCtx = new AudioCtx()
    }
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
      const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6 (Acorde triunfal)
      notes.forEach((freq, idx) => {
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
  } catch (e) {
    console.error('Error al reproducir audio:', e)
  }
}

// Lógica de vibración táctil
function triggerVibration(pattern: number | number[]) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

function App() {
  // Cargar puntos persistentes de localStorage
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem('passion_play_points')
    return saved ? parseInt(saved, 10) : 0
  })

  const [levelId, setLevelId] = useState('romantico')
  const [cardIndex, setCardIndex] = useState(0)

  const [usedIndices, setUsedIndices] = useState<Record<string, number[]>>({
    romantico: [],
    coqueto: [],
    atrevido: [],
    intenso: [],
  })

  const [showCard, setShowCard] = useState(false)
  const [showRoulette, setShowRoulette] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
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

  const isUnlocked = (item: Level) => points >= item.points

  // Guardar puntos en localStorage
  useEffect(() => {
    localStorage.setItem('passion_play_points', points.toString())
  }, [points])

  // Lógica del temporizador regresivo
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isTimerRunning && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev !== null ? prev - 1 : 0))
      }, 1000)
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false)
      playSound('timer_end')
      triggerVibration([200, 100, 200])
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning, timerSeconds])

  function selectLevel(item: Level) {
    if (!isUnlocked(item)) return
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
      if (!currentUsed.includes(i)) {
        availableIndices.push(i)
      }
    }

    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]

    setUsedIndices((prev) => ({
      ...prev,
      [currentLevelId]: [...(prev[currentLevelId] || []), randomIndex],
    }))

    return randomIndex
  }

  function spinRoulette() {
    if (spinning) return

    setSpinning(true)
    setRouletteResult(null)
    setActivePenalty(null)
    setIsFlipped(false)

    // Sonidos de giros
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

      const ptsToAdd = selectedCard.type === 'doble' ? 30 : 15
      setPoints((currentPoints) => currentPoints + ptsToAdd)
    }, 2500)
  }

  function nextCard() {
    playSound('click')
    const newIndex = getUniqueRandomIndex(levelId)
    setCardIndex(newIndex)
    setActivePenalty(null)
    setIsFlipped(false)
    setIsTimerRunning(false)
    setTimerSeconds(null)

    const nextCardItem = cards[newIndex]
    const ptsToAdd = nextCardItem.type === 'doble' ? 20 : 10
    setPoints((currentPoints) => currentPoints + ptsToAdd)
  }

  function triggerLevelPenalty() {
    playSound('click')
    triggerVibration(50)
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

  function renderCardBadge(type: CardType) {
    switch (type) {
      case 'verdad_penitencia':
        return <span className="card-badge penalty-badge">🔥 VERDAD O PENITENCIA</span>
      case 'tiempo':
        return <span className="card-badge time-badge">⏱ RETO DE TIEMPO</span>
      case 'doble':
        return <span className="card-badge double-badge">✨ DOBLE O NADA (+30 PTS)</span>
      default:
        return <span className="card-badge standard-badge">♥ RETO DIRECTO</span>
    }
  }

  return (
    <main className="app-shell">
      {/* HEADER 3D */}
      <header className="topbar">
        <div className="brand-mark">
          P<span>✦</span>
        </div>
        <div className="brand-copy">
          <strong>PASSION <em>PLAY</em></strong>
          <small>CONEXIÓN · JUEGO · COMPLICIDAD</small>
        </div>
        <button
          className="profile-dot"
          onClick={() => { playSound('click'); setShowInfo(true); }}
          aria-label="Información"
        >
          ?
        </button>
      </header>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="eyebrow">
          <span className="live-dot" /> EXPERIENCIA PREMIUM 3D
        </div>
        <h1>
          Una chispa.
          <br />
          <span>Mil posibilidades.</span>
        </h1>
        <p>Acepten retos, respondan verdades o cumplan penitencias en pareja.</p>
        <div className="hero-orb">
          <div className="orb-inner">♥</div>
          <span className="orb-spark s1">✦</span>
          <span className="orb-spark s2">✧</span>
        </div>
      </section>

      {/* ESTADÍSTICAS */}
      <section className="stats-row">
        <div className="stat-card">
          <span className="stat-label">TUS PUNTOS</span>
          <strong>{points}</strong>
          <small>pts guardados</small>
        </div>
        <div className="stat-card">
          <span className="stat-label">NIVEL ACTUAL</span>
          <strong>{level.title}</strong>
          <small>tu aventura continúa</small>
        </div>
      </section>

      {/* NIVELES */}
      <section className="section-head">
        <div>
          <span className="section-kicker">ELIGE TU VIBRA</span>
          <h2>Modos de juego</h2>
        </div>
        <span className="step-count">
          {String(levels.findIndex((item) => item.id === levelId) + 1).padStart(2, '0')} / 04
        </span>
      </section>

      <section className="levels-grid">
        {levels.map((item, index) => {
          const unlocked = isUnlocked(item)
          return (
            <button
              key={item.id}
              className={`level-card ${item.id} ${
                levelId === item.id ? 'selected' : ''
              } ${!unlocked ? 'locked' : ''}`}
              onClick={() => selectLevel(item)}
              disabled={!unlocked}
            >
              <div className="level-top">
                <span className="level-icon">{item.symbol}</span>
                {!unlocked && <span className="lock-icon">🔒</span>}
              </div>
              <strong>{item.title}</strong>
              <small>{item.subtitle}</small>
              <div className="level-bottom">
                <span>
                  {!unlocked
                    ? `${item.points} PTS PARA ABRIR`
                    : levelId === item.id
                    ? 'SELECCIONADO'
                    : 'JUGAR'}
                </span>
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>
            </button>
          )
        })}
      </section>

      {/* MODOS DE JUEGO */}
      <section className="section-head play-head">
        <div>
          <span className="section-kicker">SU MOMENTO, SUS REGLAS</span>
          <h2>¿Cómo quieren jugar?</h2>
        </div>
      </section>

      <div className="mode-switch">
        <button
          className={mode === 'local' ? 'active' : ''}
          onClick={() => { playSound('click'); setMode('local'); }}
        >
          <span>▣</span>
          <strong>Un celular</strong>
          <small>Jueguen juntos</small>
        </button>
        <button
          className={mode === 'online' ? 'active' : ''}
          onClick={() => { playSound('click'); setMode('online'); }}
        >
          <span>⌁</span>
          <strong>Dos celulares</strong>
          <small>Modo en línea (Pronto)</small>
        </button>
      </div>

      {mode === 'online' && (
        <div className="notice">
          ✦ Modo en línea en desarrollo. Disfruten la experiencia local optimizada con sonidos y efectos.
        </div>
      )}

      {/* BOTÓN PRINCIPAL 3D */}
      <button
        className="primary-cta"
        onClick={() => {
          playSound('click')
          setShowRoulette(true)
          setRouletteResult(null)
          setActivePenalty(null)
        }}
      >
        ♥ &nbsp; GIRAR LA RULETA &nbsp; ✦
      </button>

      <p className="consent-note">
        ♥ ¿No saben qué decir? Las penitencias se adaptan al nivel {level.title.toUpperCase()}.
      </p>

      <footer>
        <span>PASSION PLAY © 2026</span>
        <span>EDICIÓN 3D CON SONIDOS Y PERSISTENCIA</span>
      </footer>

      {/* MODAL DE RULETA */}
      {showRoulette && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Ruleta de retos">
          <div className="modal-content roulette-modal">
            <button
              className="modal-close"
              onClick={closeRoulette}
              aria-label="Cerrar ruleta"
              disabled={spinning}
            >
              ×
            </button>

            <span className="section-kicker">PASSION PLAY · RULETA 3D</span>
            <h2>¿Qué desafío les espera?</h2>

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

                <button
                  className="next-button"
                  onClick={() => {
                    playSound('click')
                    setShowRoulette(false)
                    setShowCard(true)
                  }}
                >
                  ABRIR TARJETA 3D ✦
                </button>
              </div>
            )}

            <button className="next-button" disabled={spinning} onClick={spinRoulette}>
              {spinning ? 'GIRANDO...' : 'GIRAR LA RULETA ✦'}
            </button>

            <p className="consent-note">Cada nivel incluye sus propias penitencias.</p>
          </div>
        </div>
      )}

      {/* MODAL DE TARJETA 3D VOLTEABLE Y TEMPORIZADOR */}
      {showCard && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-content card-modal-3d">
            <button
              className="modal-close"
              onClick={() => {
                playSound('click')
                setShowCard(false)
                setActivePenalty(null)
                setIsFlipped(false)
                setIsTimerRunning(false)
              }}
              aria-label="Cerrar tarjeta"
            >
              ×
            </button>

            {/* CONTENEDOR 3D FLIP */}
            <div
              className={`flip-card-container ${isFlipped ? 'flipped' : ''}`}
              onClick={() => {
                if (!isFlipped) {
                  playSound('click')
                  triggerVibration(30)
                  setIsFlipped(true)
                }
              }}
            >
              <div className="flip-card-inner">
                {/* REVERSO DE LA TARJETA */}
                <div className="flip-card-front">
                  <div className="brand-mark big-mark">P<span>✦</span></div>
                  <h3>PASSION PLAY</h3>
                  <p>Toca para revelar tu reto</p>
                  <span className="flip-hint">✦ ✦ ✦</span>
                </div>

                {/* FRENTE DE LA TARJETA (REVELADA) */}
                <div className="flip-card-back">
                  {renderCardBadge(card.type)}
                  <h2>{card.title}</h2>
                  <p>{card.prompt}</p>

                  {/* TEMPORIZADOR INTEGRADO */}
                  {card.duration && (
                    <div className="timer-box">
                      {timerSeconds === null ? (
                        <button className="timer-btn" onClick={() => startTimer(card.duration!)}>
                          ⏱ Iniciar Tiempo ({card.duration}s)
                        </button>
                      ) : (
                        <div className="timer-display">
                          <span className="timer-number">{timerSeconds}s</span>
                          <span className="timer-status">
                            {isTimerRunning ? '¡En marcha!' : '¡Tiempo terminado! 🎉'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CAJA DE PENITENCIA */}
                  {activePenalty && (
                    <div className="penalty-box">
                      <span className="penalty-title">😈 PENITENCIA [{level.title.toUpperCase()}]</span>
                      <p>{activePenalty}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card-footer">
              <span>NIVEL {level.title.toUpperCase()}</span>
              <span>{card.type === 'doble' ? '+30 PTS' : '+10 PTS'}</span>
            </div>

            {isFlipped && (
              <>
                <button className="next-button" onClick={nextCard}>
                  ¡RETO COMPLETADO! ✦
                </button>

                {!activePenalty ? (
                  <button className="pass-button penalty-btn" onClick={triggerLevelPenalty}>
                    😈 No sé qué decir / Ver Penitencia
                  </button>
                ) : (
                  <button className="pass-button" onClick={nextCard}>
                    Siguiente Reto ✦
                  </button>
                )}
              </>
            )}

            <small className="consent-note">
              Jueguen con respeto y complicidad. Disfruten la experiencia.
            </small>
          </div>
        </div>
      )}

      {/* INFORMACIÓN */}
      {showInfo && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-content info-content">
            <button
              className="modal-close"
              onClick={() => { playSound('click'); setShowInfo(false); }}
              aria-label="Cerrar información"
            >
              ×
            </button>

            <div className="brand-mark big-mark">
              P<span>✦</span>
            </div>
            <h2>Experiencia Completa 3D</h2>
            <p>
              PASSION PLAY incluye audio sintético nativo, respuestas táctiles, temporizadores para retos de tiempo y tarjetas 3D volteables.
            </p>
            <p>
              Tu puntuación se guarda automáticamente en tu navegador para continuar en cualquier momento.
            </p>
            <button className="next-button" onClick={() => { playSound('click'); setShowInfo(false); }}>
              ¡ENTENDIDO!
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default App