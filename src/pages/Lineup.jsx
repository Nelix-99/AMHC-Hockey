import { useState, useEffect, useCallback, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useApp } from '../context/AppContext'
import { getPositions, formatTime, getInitials, FORMAT_OPTIONS, HALF_DURATION_MS } from '../utils/positions'
import FieldSVG from '../components/FieldSVG'
import PlayerAvatar from '../components/PlayerAvatar'

// ── Bench chip (draggable only) ──────────────────────────────────────────────

function DraggableChip({ player, fromPosition, timer, benchTimer = 0 }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    data: { fromPosition },
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.35 : 1, touchAction: 'none' }}
      {...listeners}
      {...attributes}
      className="flex items-center gap-2 bg-white border-2 border-gray-100 rounded-xl px-2 py-1.5 cursor-grab active:cursor-grabbing shadow-sm select-none hover:border-amhc-green/40 hover:shadow-md transition-all"
    >
      <PlayerAvatar player={player} size="sm" />
      <span className="text-sm font-medium text-gray-800 truncate max-w-[90px]">{player.name}</span>
      <div className="ml-auto flex flex-col items-end gap-0.5">
        {timer > 0 && <span className="text-[10px] text-amhc-green font-mono font-semibold leading-none">{formatTime(timer)}</span>}
        {benchTimer > 0 && <span className="text-[10px] text-orange-400 font-mono font-semibold leading-none">B {formatTime(benchTimer)}</span>}
      </div>
    </div>
  )
}

// ── Field chip (draggable + droppable) ───────────────────────────────────────

function FieldChip({ player, posId, timer }) {
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: player.id,
    data: { fromPosition: posId },
  })
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: posId })

  // Merge both refs onto the same DOM node
  const setRef = (node) => { setDragRef(node); setDropRef(node) }

  return (
    <div
      ref={setRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.35 : 1, touchAction: 'none' }}
      {...listeners}
      {...attributes}
      className={`flex flex-col items-center cursor-grab active:cursor-grabbing select-none rounded-xl p-1 transition-colors ${isOver ? 'bg-yellow-300/30 ring-2 ring-yellow-300 ring-offset-1' : ''}`}
    >
      <PlayerAvatar player={player} size="sm" />
      <span className="text-white text-[9px] font-medium mt-0.5 text-center leading-tight max-w-[52px] truncate drop-shadow">
        {player.name.split(' ')[0]}
      </span>
      {timer > 0 && (
        <span className="text-yellow-300 text-[9px] font-mono drop-shadow">{formatTime(timer)}</span>
      )}
    </div>
  )
}

// ── Empty position slot (droppable only) ────────────────────────────────────

function EmptySlot({ posId, label }) {
  const { setNodeRef, isOver } = useDroppable({ id: posId })
  return (
    <div
      ref={setNodeRef}
      className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${
        isOver ? 'border-yellow-300 bg-yellow-300/40 scale-110' : 'border-white/50 bg-white/15'
      }`}
    >
      <span className="text-white/70 text-[10px] font-semibold">{label}</span>
    </div>
  )
}

// ── Field position slot ──────────────────────────────────────────────────────

function PositionSlot({ pos, player, timer }) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    >
      {player
        ? <FieldChip player={player} posId={pos.id} timer={timer} />
        : <EmptySlot posId={pos.id} label={pos.label} />
      }
    </div>
  )
}

// ── Bench drop zone ──────────────────────────────────────────────────────────

function Bench({ benchIds, players, getTimer, getBenchTimer }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'bench' })

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 overflow-y-auto rounded-2xl border-2 p-3 transition-colors min-h-[200px] ${
        isOver ? 'border-amhc-green bg-[#0068470d]' : 'border-dashed border-gray-300 bg-gray-50'
      }`}
    >
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
        Bank ({benchIds.length})
      </p>
      {benchIds.length === 0 ? (
        <p className="text-xs text-gray-400 text-center mt-6">Alle spelers op het veld</p>
      ) : (
        <div className="space-y-1.5">
          {benchIds.map(id => {
            const player = players.find(p => p.id === id)
            if (!player) return null
            return (
              <DraggableChip
                key={id}
                player={player}
                fromPosition="bench"
                timer={getTimer(id)}
                benchTimer={getBenchTimer(id)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Ghost shown while dragging ───────────────────────────────────────────────

function DragGhost({ player }) {
  if (!player) return null
  return (
    <div className="flex items-center gap-2 bg-white border-2 border-amhc-green rounded-xl px-3 py-2 shadow-xl pointer-events-none">
      <PlayerAvatar player={player} size="sm" />
      <span className="text-sm font-medium text-gray-800">{player.name}</span>
    </div>
  )
}

// ── Match clock display ──────────────────────────────────────────────────────

function formatClockTime(ms) {
  if (ms <= 0) return '0:00'
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// ── Main Lineup page ─────────────────────────────────────────────────────────

export default function Lineup() {
  const { players, matches, updateMatch } = useApp()
  const activePlayers = players.filter(p => !p.archived)

  // Restore state from sessionStorage so clock/timers survive navigation
  const [sv] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('fhm_lineup') || '{}') } catch { return {} }
  })

  const [selectedMatchId, setSelectedMatchId] = useState(sv.selectedMatchId ?? '')
  const [format, setFormat] = useState(sv.format ?? 8)
  const [positions, setPositions] = useState(() => sv.positions ?? getPositions(sv.format ?? 8))
  const [bench, setBench] = useState(() => sv.bench ?? activePlayers.map(p => p.id))
  const [selectedPlayers, setSelectedPlayers] = useState(() => sv.selectedPlayers ?? activePlayers.map(p => p.id))
  const [timers, setTimers] = useState(sv.timers ?? {})
  const [benchTimers, setBenchTimers] = useState(sv.benchTimers ?? {})
  const [activeId, setActiveId] = useState(null)
  const [tick, setTick] = useState(0)
  const [savedMsg, setSavedMsg] = useState('')
  const [clock, setClock] = useState(sv.clock ?? { running: false, half: 1, elapsed: 0, startTimestamp: null })
  const [score, setScore] = useState(sv.score ?? { home: 0, away: 0 })
  const [showSelection, setShowSelection] = useState(false)

  // Persist all lineup state to sessionStorage on every change
  useEffect(() => {
    sessionStorage.setItem('fhm_lineup', JSON.stringify({
      selectedMatchId, format, positions, bench, selectedPlayers,
      timers, benchTimers, clock, score,
    }))
  }, [selectedMatchId, format, positions, bench, selectedPlayers, timers, benchTimers, clock, score])

  // Tick every second to update timer and clock displays
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const getTimer = useCallback((playerId) => {
    const t = timers[playerId]
    if (!t) return 0
    return t.accumulated + (t.startTime != null ? Date.now() - t.startTime : 0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timers, tick])

  const getBenchTimer = useCallback((playerId) => {
    const t = benchTimers[playerId]
    if (!t) return 0
    return t.accumulated + (t.startTime != null ? Date.now() - t.startTime : 0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [benchTimers, tick])

  const clockElapsed = clock.running && clock.startTimestamp != null
    ? clock.elapsed + (Date.now() - clock.startTimestamp)
    : clock.elapsed

  const halfDone = clockElapsed >= HALF_DURATION_MS

  const onFieldIds = () => positions.filter(p => p.playerId).map(p => p.playerId)

  const toggleClock = () => {
    const now = Date.now()
    const fieldIds = onFieldIds()
    const benchIds = bench.filter(id => selectedPlayers.includes(id))
    if (clock.running) {
      // Pause — accumulate field timers, stop bench timers
      setTimers(prev => {
        const next = { ...prev }
        for (const pid of fieldIds) {
          const t = next[pid] || { startTime: null, accumulated: 0 }
          next[pid] = { startTime: null, accumulated: t.accumulated + (t.startTime != null ? now - t.startTime : 0) }
        }
        return next
      })
      setBenchTimers(prev => {
        const next = { ...prev }
        for (const pid of benchIds) {
          const t = next[pid] || { startTime: null, accumulated: 0 }
          next[pid] = { startTime: null, accumulated: t.accumulated + (t.startTime != null ? now - t.startTime : 0) }
        }
        return next
      })
      setClock(prev => ({ ...prev, running: false, elapsed: prev.elapsed + (prev.startTimestamp != null ? now - prev.startTimestamp : 0), startTimestamp: null }))
    } else {
      // Start — kick off field timers, start bench timers
      setTimers(prev => {
        const next = { ...prev }
        for (const pid of fieldIds) {
          const t = next[pid] || { startTime: null, accumulated: 0 }
          if (t.startTime == null) next[pid] = { ...t, startTime: now }
        }
        return next
      })
      setBenchTimers(prev => {
        const next = { ...prev }
        for (const pid of benchIds) {
          const t = next[pid] || { startTime: null, accumulated: 0 }
          if (t.startTime == null) next[pid] = { ...t, startTime: now }
        }
        return next
      })
      setClock(prev => ({ ...prev, running: true, startTimestamp: now }))
    }
  }

  const stopAllTimers = (now) => {
    setTimers(prev => {
      const next = { ...prev }
      for (const pid of onFieldIds()) {
        const t = next[pid] || { startTime: null, accumulated: 0 }
        next[pid] = { startTime: null, accumulated: t.accumulated + (t.startTime != null ? now - t.startTime : 0) }
      }
      return next
    })
    setBenchTimers(prev => {
      const next = { ...prev }
      for (const pid of bench.filter(id => selectedPlayers.includes(id))) {
        const t = next[pid] || { startTime: null, accumulated: 0 }
        next[pid] = { startTime: null, accumulated: t.accumulated + (t.startTime != null ? now - t.startTime : 0) }
      }
      return next
    })
  }

  const switchHalf = (h) => {
    const now = Date.now()
    if (clock.running) stopAllTimers(now)
    setClock({ running: false, half: h, elapsed: 0, startTimestamp: null })
  }

  const resetClock = () => {
    const now = Date.now()
    if (clock.running) stopAllTimers(now)
    setClock({ running: false, half: 1, elapsed: 0, startTimestamp: null })
    setTimers({})
    setBenchTimers({})
  }

  const changeFormat = (f) => {
    const newPositions = getPositions(f)
    const onFieldIds = positions.map(p => p.playerId).filter(Boolean)
    const now = Date.now()
    setTimers(prev => {
      const next = { ...prev }
      for (const pid of onFieldIds) {
        const t = next[pid] || { startTime: null, accumulated: 0 }
        next[pid] = { startTime: null, accumulated: t.accumulated + (t.startTime != null ? now - t.startTime : 0) }
      }
      return next
    })
    setPositions(newPositions)
    setBench(selectedPlayers)
    setFormat(f)
  }

  const resetLineup = () => {
    const now = Date.now()
    setTimers(prev => {
      const next = { ...prev }
      for (const pid of Object.keys(next)) {
        const t = next[pid]
        next[pid] = { startTime: null, accumulated: t.accumulated + (t.startTime != null ? now - t.startTime : 0) }
      }
      return next
    })
    setPositions(getPositions(format))
    setBench(selectedPlayers)
  }

  const resetTimers = () => setTimers({})

  const saveLineup = () => {
    if (!selectedMatchId) return
    const lineup = positions.filter(p => p.playerId).map(p => ({ positionId: p.id, playerId: p.playerId }))
    updateMatch({ id: selectedMatchId, lineup, scoreHome: score.home, scoreAway: score.away, attendees: selectedPlayers })
    setSavedMsg('Opstelling opgeslagen!')
    setTimeout(() => setSavedMsg(''), 2000)
  }

  // Load saved lineup when match changes
  useEffect(() => {
    if (!selectedMatchId) return
    const match = matches.find(m => m.id === selectedMatchId)
    if (match?.scoreHome != null) setScore({ home: match.scoreHome, away: match.scoreAway ?? 0 })
    if (match?.attendees?.length) {
      setSelectedPlayers(match.attendees)
    }
    if (!match?.lineup?.length) return
    const newPositions = getPositions(format).map(pos => {
      const saved = match.lineup.find(l => l.positionId === pos.id)
      return saved ? { ...pos, playerId: saved.playerId } : pos
    })
    const onFieldIds = new Set(newPositions.map(p => p.playerId).filter(Boolean))
    setPositions(newPositions)
    const attendees = match.attendees?.length ? match.attendees : activePlayers.map(p => p.id)
    setBench(attendees.filter(id => !onFieldIds.has(id)))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMatchId])

  // Keep bench in sync when selectedPlayers changes (remove absent players from bench/field)
  const togglePlayerSelection = (id) => {
    setSelectedPlayers(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      // If removing from selection, also remove from field
      if (!next.includes(id)) {
        const onField = positions.some(p => p.playerId === id)
        if (onField) {
          setPositions(pos => pos.map(p => p.playerId === id ? { ...p, playerId: null } : p))
        }
        setBench(b => b.filter(x => x !== id))
      } else {
        // Add back to bench if not on field
        const onField = positions.some(p => p.playerId === id)
        if (!onField) setBench(b => b.includes(id) ? b : [...b, id])
      }
      return next
    })
  }

  const selectAll = () => {
    setSelectedPlayers(activePlayers.map(p => p.id))
    const onFieldIds = new Set(positions.map(p => p.playerId).filter(Boolean))
    setBench(activePlayers.filter(p => !onFieldIds.has(p.id)).map(p => p.id))
  }

  const clearAll = () => {
    setSelectedPlayers([])
    setPositions(pos => pos.map(p => ({ ...p, playerId: null })))
    setBench([])
  }

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  )

  const handleDragStart = ({ active }) => setActiveId(active.id)

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over) return

    const draggedId = active.id
    const dropId = over.id
    const now = Date.now()

    const fromPos = positions.find(p => p.playerId === draggedId)
    const fromBench = !fromPos

    if (!fromBench && fromPos.id === dropId) return

    let newPositions = positions.map(p => ({ ...p }))
    let newBench = [...bench]

    if (dropId === 'bench') {
      if (!fromBench) {
        newPositions = newPositions.map(p => p.playerId === draggedId ? { ...p, playerId: null } : p)
        newBench = [...newBench, draggedId]
      }
    } else {
      const targetSlot = newPositions.find(p => p.id === dropId)
      if (!targetSlot) return

      const displacedId = targetSlot.playerId

      newPositions = newPositions.map(p => {
        if (p.id === dropId) return { ...p, playerId: draggedId }
        if (fromPos && p.id === fromPos.id) return { ...p, playerId: displacedId ?? null }
        return p
      })

      if (fromBench) {
        newBench = newBench.filter(id => id !== draggedId)
        if (displacedId) newBench = [...newBench, displacedId]
      }
    }

    setPositions(newPositions)
    setBench(newBench)

    const wasOnField = (pid) => positions.some(p => p.playerId === pid)
    const isOnField = (pid) => newPositions.some(p => p.playerId === pid)

    const involved = [...new Set([draggedId, fromPos?.playerId, positions.find(p => p.id === dropId)?.playerId].filter(Boolean))]

    setTimers(prev => {
      const next = { ...prev }
      for (const pid of involved) {
        const was = wasOnField(pid)
        const is = isOnField(pid)
        const t = next[pid] || { startTime: null, accumulated: 0 }
        if (!was && is) {
          next[pid] = { ...t, startTime: clock.running ? now : null }
        } else if (was && !is) {
          next[pid] = { startTime: null, accumulated: t.accumulated + (t.startTime != null ? now - t.startTime : 0) }
        }
      }
      return next
    })

    // Mirror bench timer — opposite logic to field timer
    setBenchTimers(prev => {
      const next = { ...prev }
      for (const pid of involved) {
        const was = wasOnField(pid)
        const is = isOnField(pid)
        const t = next[pid] || { startTime: null, accumulated: 0 }
        if (!was && is) {
          // went to field: stop bench timer
          next[pid] = { startTime: null, accumulated: t.accumulated + (t.startTime != null ? now - t.startTime : 0) }
        } else if (was && !is) {
          // went to bench: start bench timer if clock running
          next[pid] = { ...t, startTime: clock.running ? now : null }
        }
      }
      return next
    })
  }

  const activePlayer = activeId ? activePlayers.find(p => p.id === activeId) : null
  const sortedMatches = [...matches].sort((a, b) => a.date.localeCompare(b.date))
  const visibleBench = bench.filter(id => selectedPlayers.includes(id))

  const selectedMatch = matches.find(m => m.id === selectedMatchId)

  const MONTHS_SHORT = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec']
  const fmtMatchDate = (iso) => {
    const [, m, d] = iso.split('-')
    return `${Number(d)} ${MONTHS_SHORT[Number(m) - 1]}`
  }

  return (
    <div className="max-w-6xl mx-auto px-3 py-6">

      {/* Page header row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold text-amhc-black mr-auto">Opstelling</h1>
        {/* Format dropdown */}
        <select
          value={format}
          onChange={e => changeFormat(Number(e.target.value))}
          className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amhc-green transition-colors font-medium"
        >
          {FORMAT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button onClick={resetLineup} className="text-sm font-bold text-amhc-gray hover:text-amhc-black px-3 py-2 border-2 border-gray-200 rounded-xl hover:border-amhc-green/30 transition-colors">
          Wissen
        </button>
        <button onClick={resetTimers} className="text-sm font-bold text-amhc-gray hover:text-amhc-black px-3 py-2 border-2 border-gray-200 rounded-xl hover:border-amhc-green/30 transition-colors">
          Tijden wissen
        </button>
        {selectedMatchId && (
          <button onClick={saveLineup} className="w-full sm:w-auto text-xs bg-brand-green hover:bg-brand-dark text-white px-4 py-1.5 rounded-lg font-bold transition-colors shadow-sm">
            Opstelling opslaan
          </button>
        )}
        {savedMsg && <span className="text-amhc-green text-sm font-bold">{savedMsg}</span>}
      </div>

      {/* Match selector card */}
      {!selectedMatchId ? (
        <div className="mb-4 rounded-2xl border-2 border-dashed p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4" style={{ borderColor: '#006847', backgroundColor: '#f0faf5' }}>
          <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: '#006847' }}>
            📅
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-amhc-black text-sm">Selecteer een wedstrijd</p>
            <p className="text-xs text-amhc-gray mt-0.5">Koppel de opstelling aan een wedstrijd om score, klok en selectie op te slaan.</p>
          </div>
          <select
            value={selectedMatchId}
            onChange={e => setSelectedMatchId(e.target.value)}
            className="w-full sm:w-auto border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors font-semibold text-amhc-black"
            style={{ borderColor: '#006847', backgroundColor: 'white' }}
          >
            <option value="">Kies wedstrijd…</option>
            {sortedMatches.map(m => (
              <option key={m.id} value={m.id}>
                {fmtMatchDate(m.date)} · {m.opponent} ({m.isHome ? 'Thuis' : 'Uit'})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="mb-4 rounded-2xl border px-4 py-3 flex items-center gap-3" style={{ borderColor: '#006847', backgroundColor: '#f0faf5' }}>
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#006847' }} />
          <div className="flex-1 min-w-0">
            <span className="font-bold text-amhc-black text-sm">
              {fmtMatchDate(selectedMatch.date)} · {selectedMatch.opponent}
            </span>
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-md font-bold ${selectedMatch.isHome ? 'bg-[#0068471a] text-amhc-green' : 'bg-blue-50 text-blue-700'}`}>
              {selectedMatch.isHome ? 'Thuis' : 'Uit'}
            </span>
          </div>
          <select
            value={selectedMatchId}
            onChange={e => setSelectedMatchId(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none font-medium text-amhc-gray bg-white"
          >
            <option value="">— geen wedstrijd —</option>
            {sortedMatches.map(m => (
              <option key={m.id} value={m.id}>
                {fmtMatchDate(m.date)} · {m.opponent} ({m.isHome ? 'T' : 'U'})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Player selection panel */}
      <div className="mb-4 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="text-xs font-semibold text-amhc-gray">
            Selectie <span className="text-amhc-green font-bold">{selectedPlayers.length}/{activePlayers.length}</span>
          </span>
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={selectAll} className="text-[11px] text-amhc-green font-semibold px-2 py-0.5 rounded hover:bg-[#0068471a] transition-colors">Alle</button>
            <span className="text-gray-200 text-xs">|</span>
            <button onClick={clearAll} className="text-[11px] text-gray-400 font-semibold px-2 py-0.5 rounded hover:bg-gray-100 transition-colors">Geen</button>
            <button
              onClick={() => setShowSelection(s => !s)}
              className="text-[11px] text-gray-500 font-semibold ml-1 px-2.5 py-0.5 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors flex items-center gap-1"
            >
              {showSelection ? 'Sluiten' : 'Bewerken'}
              <span className={`transition-transform ${showSelection ? 'rotate-180' : ''}`}>▾</span>
            </button>
          </div>
        </div>
        {showSelection && (
          <div className="flex flex-wrap gap-1.5 px-3 pb-3 pt-1 border-t border-gray-100">
            {activePlayers.map(p => {
              const present = selectedPlayers.includes(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() => togglePlayerSelection(p.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    present
                      ? 'bg-[#0068471a] border-amhc-green text-amhc-dark'
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${present ? 'bg-amhc-green' : 'bg-gray-300'}`} />
                  {p.name.split(' ')[0]}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Match clock + score */}
      {selectedMatchId && (
        <div className="mb-4 card">
          <div className="flex flex-wrap items-center gap-4">
            {/* Clock */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Half toggle */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {[1, 2].map(h => (
                  <button
                    key={h}
                    onClick={() => switchHalf(h)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${clock.half === h ? 'bg-white shadow-sm text-amhc-black' : 'text-gray-500 hover:text-amhc-black'}`}
                  >
                    {h}e helft
                  </button>
                ))}
              </div>
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-amhc-black tabular-nums">
                  {formatClockTime(Math.max(0, HALF_DURATION_MS - clockElapsed))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={toggleClock}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors text-white ${clock.running ? 'bg-orange-500 hover:bg-orange-600' : 'bg-brand-green hover:bg-brand-dark'}`}
                >
                  {clock.running ? 'Pauzeren' : (clock.elapsed === 0 ? 'Starten' : 'Hervatten')}
                </button>
                {(clock.elapsed > 0 || clock.half > 1) && (
                  <button onClick={resetClock} className="text-xs text-gray-400 hover:text-gray-600 text-center">
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div className="w-px h-16 bg-gray-200 hidden sm:block" />

            {/* Score */}
            <div className="flex items-center gap-2">
              {[
                { key: 'home', label: selectedMatch?.isHome ? 'AMHC' : (selectedMatch?.opponent || 'AMHC'), val: score.home, color: '#006847' },
                { key: 'away', label: selectedMatch?.isHome ? (selectedMatch?.opponent || 'Tegenstander') : 'AMHC', val: score.away, color: '#101010' },
              ].map((team, i) => (
                <div key={team.key} className="flex items-center gap-2">
                  {i === 1 && <span className="text-xl font-black text-gray-300 select-none px-1">–</span>}
                  <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block truncate max-w-[64px]" style={{ color: team.color }}>{team.label}</span>
                  <button
                    onClick={() => setScore(s => ({ ...s, [team.key]: Math.max(0, s[team.key] - 1) }))}
                    className="w-7 h-7 rounded-full text-sm font-black transition-all active:scale-95 flex items-center justify-center"
                    style={{ backgroundColor: '#f3f4f6', color: '#9ca3af' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#ef4444' }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#9ca3af' }}
                  >−</button>
                  <span className="text-3xl font-black tabular-nums w-8 text-center leading-none" style={{ color: team.color }}>{team.val}</span>
                  <button
                    onClick={() => setScore(s => ({ ...s, [team.key]: s[team.key] + 1 }))}
                    className="w-7 h-7 rounded-full text-sm font-black text-white transition-all active:scale-95 flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: team.color }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >+</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col md:flex-row gap-4 items-start">

          {/* Field */}
          <div className="w-full max-w-xs sm:max-w-sm mx-auto md:mx-0 md:flex-shrink-0">
            <div className="relative rounded-xl overflow-hidden shadow-lg" style={{ aspectRatio: '300/500' }}>
              <div className="absolute inset-0">
                <FieldSVG />
              </div>
              {positions.map(pos => {
                const player = pos.playerId ? activePlayers.find(p => p.id === pos.playerId) : null
                return (
                  <PositionSlot
                    key={pos.id}
                    pos={pos}
                    player={player}
                    timer={pos.playerId ? getTimer(pos.playerId) : 0}
                  />
                )
              })}
            </div>
          </div>

          {/* Bench */}
          <div className="w-full md:flex-1 flex flex-col gap-3">
            <div className="bg-[#0068471a] border border-amhc-green/30 rounded-xl p-3 text-xs text-amhc-dark font-medium">
              <strong>Sleep spelers</strong> van de bank naar het veld of direct op een andere speler om te wisselen. Speeltijden lopen mee met de wedstrijdklok.
            </div>
            <Bench benchIds={visibleBench} players={activePlayers} getTimer={getTimer} getBenchTimer={getBenchTimer} />

            {/* Timer summary */}
            {activePlayers.some(p => getTimer(p.id) > 0 || getBenchTimer(p.id) > 0) && (
              <div className="bg-white rounded-2xl shadow-sm p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-amhc-gray uppercase tracking-wide">Speeltijd</p>
                  <div className="flex gap-3 text-[10px] font-semibold">
                    <span className="text-amhc-green">Veld</span>
                    <span className="text-orange-400">Bank</span>
                  </div>
                </div>
                <ul className="space-y-1">
                  {activePlayers
                    .filter(p => getTimer(p.id) > 0 || getBenchTimer(p.id) > 0)
                    .sort((a, b) => getTimer(b.id) - getTimer(a.id))
                    .map(p => {
                      const onField = positions.some(pos => pos.playerId === p.id)
                      const fieldTime = getTimer(p.id)
                      const bankTime = getBenchTimer(p.id)
                      return (
                        <li key={p.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 truncate max-w-[100px]">{p.name}</span>
                          <div className="flex gap-3">
                            <span className={'font-mono text-xs font-medium ' + (onField ? 'text-amhc-green' : 'text-gray-300')}>
                              {fieldTime > 0 ? formatTime(fieldTime) : '-'}
                            </span>
                            <span className={'font-mono text-xs font-medium ' + (!onField && bankTime > 0 ? 'text-orange-400' : 'text-gray-300')}>
                              {bankTime > 0 ? formatTime(bankTime) : '-'}
                            </span>
                          </div>
                        </li>
                      )
                    })}
                </ul>
              </div>
            )}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activePlayer ? <DragGhost player={activePlayer} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
