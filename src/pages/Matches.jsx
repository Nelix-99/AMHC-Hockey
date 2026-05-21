import { useState } from 'react'
import { useApp } from '../context/AppContext'
import PlayerAvatar from '../components/PlayerAvatar'

function MatchModal({ match, players, onClose, onSave }) {
  const [scoreHome, setScoreHome] = useState(match.scoreHome ?? '')
  const [scoreAway, setScoreAway] = useState(match.scoreAway ?? '')
  const [attendance, setAttendance] = useState(match.attendance ?? [])

  const activePlayers = players.filter(p => !p.archived)

  const toggleAttendance = (id) =>
    setAttendance(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])

  const handleSave = () => {
    onSave({
      ...match,
      scoreHome: scoreHome === '' ? null : Number(scoreHome),
      scoreAway: scoreAway === '' ? null : Number(scoreAway),
      attendance,
    })
    onClose()
  }

  const homeLabel = match.isHome ? 'AMHC' : match.opponent
  const awayLabel = match.isHome ? match.opponent : 'AMHC'

  return (
    <div className="fixed inset-0 bg-[#101010b3] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 rounded-t-2xl flex items-center justify-between" style={{ backgroundColor: '#101010' }}>
          <div>
            <h2 className="text-lg font-bold text-white">
              {match.isHome ? 'vs' : '@'} {match.opponent}
            </h2>
            <p className="text-sm text-gray-400 font-medium mt-0.5">
              {match.date}{match.location ? ` · ${match.location}` : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none transition-colors">✕</button>
        </div>

        <div className="p-5 space-y-6">
          {/* Score */}
          <div>
            <h3 className="font-bold text-amhc-black mb-3 text-sm uppercase tracking-wide">Eindstand</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 text-center">
                <label className="block text-xs text-amhc-gray font-semibold mb-1">{homeLabel}</label>
                <input type="number" min="0" value={scoreHome} onChange={e => setScoreHome(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-center text-2xl font-bold focus:outline-none focus:border-amhc-green transition-colors" placeholder="–" />
              </div>
              <span className="text-3xl font-bold text-gray-300">–</span>
              <div className="flex-1 text-center">
                <label className="block text-xs text-amhc-gray font-semibold mb-1">{awayLabel}</label>
                <input type="number" min="0" value={scoreAway} onChange={e => setScoreAway(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-center text-2xl font-bold focus:outline-none focus:border-amhc-green transition-colors" placeholder="–" />
              </div>
            </div>
          </div>

          {/* Attendance */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-amhc-black text-sm uppercase tracking-wide">
                Aanwezigheid <span className="text-amhc-green normal-case font-semibold">({attendance.length}/{activePlayers.length})</span>
              </h3>
              <div className="flex gap-3">
                <button onClick={() => setAttendance(activePlayers.map(p => p.id))}
                  className="text-xs text-amhc-green hover:underline font-semibold">Alles</button>
                <button onClick={() => setAttendance([])}
                  className="text-xs text-gray-400 hover:underline font-semibold">Wissen</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {activePlayers.map(player => {
                const present = attendance.includes(player.id)
                return (
                  <button key={player.id} onClick={() => toggleAttendance(player.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-colors ${present ? 'border-amhc-green bg-[#0068470d] text-amhc-black' : 'border-gray-200 bg-white text-amhc-gray hover:border-gray-300'}`}>
                    <PlayerAvatar player={player} size="sm" />
                    <span className="text-xs font-semibold truncate">{player.name}</span>
                    {present && <span className="ml-auto text-amhc-green text-sm font-bold">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold text-amhc-gray hover:bg-gray-50 transition-colors">
            Annuleren
          </button>
          <button onClick={handleSave} className="px-5 py-2 rounded-xl bg-brand-green hover:bg-brand-dark text-white text-sm font-bold transition-colors">
            Opslaan
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Matches() {
  const { matches, players, updateMatch } = useApp()
  const [editMatch, setEditMatch] = useState(null)
  const [filter, setFilter] = useState('all')

  const today = new Date().toISOString().slice(0, 10)

  const filtered = [...matches]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter(m => {
      if (filter === 'upcoming') return m.date >= today
      if (filter === 'past') return m.date < today
      return true
    })

  const played = matches.filter(m => m.scoreHome != null)
  const wins   = played.filter(m => (m.isHome ? m.scoreHome > m.scoreAway : m.scoreAway > m.scoreHome)).length
  const losses = played.filter(m => (m.isHome ? m.scoreHome < m.scoreAway : m.scoreAway < m.scoreHome)).length
  const draws  = played.filter(m => m.scoreHome === m.scoreAway).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-amhc-black mb-6">Wedstrijdstatistieken</h1>

      {/* Season summary */}
      {played.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[['W', wins, 'Gewonnen', 'bg-brand-green text-white'],
            ['G', draws, 'Gelijk', 'bg-gray-200 text-amhc-gray'],
            ['V', losses, 'Verloren', null]].map(([code, val, name, cls]) => (
            <div key={code}
              className={`rounded-2xl p-5 text-center ${cls || ''}`}
              style={code === 'V' ? { backgroundColor: '#101010', color: 'white' } : undefined}>
              <div className="text-4xl font-bold">{val}</div>
              <div className="text-sm font-semibold opacity-80 mt-0.5">{name}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-1 bg-gray-200 p-1 rounded-xl mb-5 w-fit">
        {[['all', 'Alles'], ['upcoming', 'Aankomend'], ['past', 'Gespeeld']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${filter === val ? 'bg-white shadow-sm text-amhc-black' : 'text-amhc-gray hover:text-amhc-black'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Match list */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 font-medium">Geen wedstrijden gevonden.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(m => {
            const isPast = m.date < today
            const hasScore = m.scoreHome != null
            const ourScore = m.isHome ? m.scoreHome : m.scoreAway
            const theirScore = m.isHome ? m.scoreAway : m.scoreHome
            const result = !hasScore ? null : ourScore > theirScore ? 'W' : ourScore < theirScore ? 'V' : 'G'
            const resultCls = result === 'W'
              ? 'bg-brand-green text-white'
              : result === 'V'
              ? 'bg-amhc-black text-white'
              : result === 'G'
              ? 'bg-gray-200 text-amhc-gray'
              : 'bg-gray-100 text-gray-400'

            return (
              <div key={m.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-start gap-3 border border-gray-100 hover:border-amhc-green/30 transition-colors">
                <div className="shrink-0 text-center w-12 pt-0.5">
                  <p className="text-xs text-amhc-gray font-mono font-semibold">{m.date.slice(5)}</p>
                  <p className="text-xs text-gray-300 font-mono">{m.date.slice(0, 4)}</p>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-amhc-black">{m.opponent || 'TBD'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-bold ${m.isHome ? 'bg-[#0068471a] text-amhc-green' : 'bg-blue-50 text-blue-700'}`}>
                      {m.isHome ? 'Thuis' : 'Uit'}
                    </span>
                  </div>
                  {m.location && <p className="text-xs text-gray-400 mt-0.5 font-medium">{m.location}</p>}
                  {m.attendance?.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">{m.attendance.length} spelers aanwezig</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {hasScore ? (
                      <span className="font-mono font-bold text-base text-amhc-black">{m.scoreHome}–{m.scoreAway}</span>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">{isPast ? 'Geen uitslag' : 'Aankomend'}</span>
                    )}
                    {result && (
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${resultCls}`}>{result}</span>
                    )}
                  </div>
                </div>

                <button onClick={() => setEditMatch(m)}
                  className="text-xs text-amhc-green hover:text-amhc-dark font-bold px-3 py-1.5 rounded-lg hover:bg-[#0068471a] transition-colors shrink-0">
                  Bewerken
                </button>
              </div>
            )
          })}
        </div>
      )}

      {editMatch && (
        <MatchModal match={editMatch} players={players} onClose={() => setEditMatch(null)} onSave={updateMatch} />
      )}
    </div>
  )
}
