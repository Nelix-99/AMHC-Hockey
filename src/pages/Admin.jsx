import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { compressPhoto, parseMatchCSV } from '../utils/csvParser'
import PlayerAvatar from '../components/PlayerAvatar'

// ── Players tab ──────────────────────────────────────────────────────────────

function PlayersTab() {
  const { players, addPlayer, updatePlayer, toggleArchivePlayer } = useApp()
  const [showArchived, setShowArchived] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', photo: null })
  const fileRef = useRef()

  const visible = players.filter(p => showArchived || !p.archived)

  const handlePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const compressed = await compressPhoto(file)
    setForm(f => ({ ...f, photo: compressed }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editId) {
      updatePlayer({ id: editId, name: form.name.trim(), photo: form.photo })
      setEditId(null)
    } else {
      addPlayer({ name: form.name.trim(), photo: form.photo })
    }
    setForm({ name: '', photo: null })
    if (fileRef.current) fileRef.current.value = ''
  }

  const startEdit = (p) => { setEditId(p.id); setForm({ name: p.name, photo: p.photo || null }) }
  const cancelEdit = () => { setEditId(null); setForm({ name: '', photo: null }) }

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-bold text-amhc-black mb-4">{editId ? 'Speler bewerken' : 'Speler toevoegen'}</h3>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-semibold text-amhc-gray mb-1 uppercase tracking-wide">Naam *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Naam speler"
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amhc-green transition-colors font-medium text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-amhc-gray mb-1 uppercase tracking-wide">Foto (optioneel)</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#0068471a] file:text-amhc-green file:text-sm file:font-semibold hover:file:bg-amhc-green/20"
            />
          </div>
          {form.photo && (
            <div className="flex flex-col items-center gap-1">
              <img src={form.photo} alt="preview" className="w-10 h-10 rounded-full object-cover border-2 border-amhc-green" />
              <button
                type="button"
                onClick={() => { setForm(f => ({ ...f, photo: null })); if (fileRef.current) fileRef.current.value = '' }}
                className="text-xs text-red-400 hover:text-red-600 font-semibold"
              >
                Verwijderen
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <button type="submit" className="bg-amhc-green hover:bg-brand-dark text-white px-5 py-2 rounded-xl font-bold transition-colors text-sm">
              {editId ? 'Opslaan' : 'Toevoegen'}
            </button>
            {editId && (
              <button type="button" onClick={cancelEdit} className="bg-gray-100 hover:bg-gray-200 text-amhc-gray px-4 py-2 rounded-xl font-semibold transition-colors text-sm">
                Annuleren
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-amhc-black">
            Spelers <span className="text-amhc-green">({players.filter(p => !p.archived).length} actief)</span>
          </h3>
          <label className="flex items-center gap-2 text-sm text-amhc-gray cursor-pointer select-none font-medium">
            <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} className="rounded accent-amhc-green" />
            Gearchiveerden tonen
          </label>
        </div>

        {visible.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Nog geen spelers toegevoegd.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {visible.map(player => (
              <li key={player.id} className={`flex items-center gap-2 py-2.5 ${player.archived ? 'opacity-40' : ''}`}>
                <PlayerAvatar player={player} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amhc-black truncate">{player.name}</p>
                  {player.archived && <p className="text-xs text-gray-400">Gearchiveerd</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(player)}
                    className="text-[11px] text-amhc-green hover:text-amhc-dark px-2 py-1 rounded-lg hover:bg-[#0068471a] transition-colors font-semibold">
                    Bewerken
                  </button>
                  <button onClick={() => toggleArchivePlayer(player.id)}
                    className="text-[11px] text-gray-400 hover:text-amhc-gray px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
                    {player.archived ? 'Herstellen' : 'Archiveren'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ── Schedule tab ─────────────────────────────────────────────────────────────

function ScheduleTab() {
  const { matches, addMatch, updateMatch, deleteMatch, importMatches } = useApp()
  const [form, setForm] = useState({ date: '', opponent: '', isHome: true, location: '' })
  const [editId, setEditId] = useState(null)
  const [csvError, setCsvError] = useState('')
  const csvRef = useRef()

  const sorted = [...matches].sort((a, b) => a.date.localeCompare(b.date))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.date || !form.opponent.trim()) return
    if (editId) { updateMatch({ id: editId, ...form }); setEditId(null) }
    else addMatch(form)
    setForm({ date: '', opponent: '', isHome: true, location: '' })
  }

  const startEdit = (m) => {
    setEditId(m.id)
    setForm({ date: m.date, opponent: m.opponent, isHome: m.isHome, location: m.location || '' })
  }

  const handleCSV = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCsvError('')
    try {
      const imported = await parseMatchCSV(file)
      if (window.confirm(`${imported.length} wedstrijden importeren? Ze worden toegevoegd aan het huidige programma.`)) {
        importMatches(imported)
      }
    } catch (err) { setCsvError(err.message) }
    finally { if (csvRef.current) csvRef.current.value = '' }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-bold text-amhc-black mb-4">{editId ? 'Wedstrijd bewerken' : 'Wedstrijd toevoegen'}</h3>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-amhc-gray mb-1 uppercase tracking-wide">Datum *</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amhc-green transition-colors text-sm font-medium" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-amhc-gray mb-1 uppercase tracking-wide">Tegenstander *</label>
            <input type="text" value={form.opponent} onChange={e => setForm(f => ({ ...f, opponent: e.target.value }))}
              placeholder="Naam tegenstander"
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amhc-green transition-colors text-sm font-medium" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-amhc-gray mb-1 uppercase tracking-wide">Locatie</label>
            <div className="flex gap-2">
              {[['Thuis', true], ['Uit', false]].map(([label, val]) => (
                <button key={label} type="button" onClick={() => setForm(f => ({ ...f, isHome: val }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-colors ${form.isHome === val ? 'bg-brand-green text-white border-amhc-green' : 'bg-white text-amhc-gray border-gray-200 hover:border-amhc-green/50'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-amhc-gray mb-1 uppercase tracking-wide">Accommodatie</label>
            <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="Naam veld / accommodatie"
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amhc-green transition-colors text-sm font-medium" />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="text-white px-6 py-2.5 rounded-xl font-bold transition-colors text-sm shadow-sm" style={{ backgroundColor: '#006847' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#004f36'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#006847'}>
              {editId ? 'Wijzigingen opslaan' : 'Wedstrijd bevestigen'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm({ date: '', opponent: '', isHome: true, location: '' }) }}
                className="bg-gray-100 hover:bg-gray-200 text-amhc-gray px-4 py-2 rounded-xl font-semibold transition-colors text-sm">
                Annuleren
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3 className="font-bold text-amhc-black mb-2">Importeren via CSV</h3>
        <p className="text-xs text-amhc-gray mb-3 font-medium">
          Verwachte kolommen: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">date, opponent, home_away, location</code>
        </p>
        <input ref={csvRef} type="file" accept=".csv,text/csv" onChange={handleCSV}
          className="text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#0068471a] file:text-amhc-green file:text-sm file:font-semibold hover:file:bg-amhc-green/20" />
        {csvError && <p className="text-red-500 text-sm mt-2 font-medium">{csvError}</p>}
      </div>

      <div className="card">
        <h3 className="font-bold text-amhc-black mb-4">
          Programma <span className="text-amhc-green">({matches.length} wedstrijden)</span>
        </h3>
        {sorted.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Nog geen wedstrijden gepland.</p>
        ) : (
          <ul>
            {sorted.map(m => (
              <li key={m.id} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-3 text-sm border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-amhc-gray w-24 shrink-0 font-mono text-xs font-semibold">{m.date}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-amhc-black">{m.opponent}</span>
                    {m.location && <span className="text-amhc-gray ml-2 text-xs">@ {m.location}</span>}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-bold shrink-0 ${m.isHome ? 'bg-[#0068471a] text-amhc-green' : 'bg-blue-50 text-blue-700'}`}>
                    {m.isHome ? 'Thuis' : 'Uit'}
                  </span>
                </div>
                <div className="flex gap-2 pl-24 sm:pl-0">
                  <button onClick={() => startEdit(m)} className="text-xs text-amhc-green hover:text-amhc-dark px-3 py-1.5 rounded-lg hover:bg-[#0068471a] font-semibold">Bewerken</button>
                  <button onClick={() => { if (window.confirm('Wedstrijd verwijderen?')) deleteMatch(m.id) }}
                    className="text-xs text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 font-semibold">Verwijderen</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Admin() {
  const [tab, setTab] = useState('players')

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-amhc-black mb-6">Teambeheer</h1>

      <div className="flex gap-1 bg-gray-200 p-1 rounded-xl mb-6 w-fit">
        {[['players', 'Spelers'], ['schedule', 'Programma']].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${tab === val ? 'bg-white shadow-sm text-amhc-black' : 'text-amhc-gray hover:text-amhc-black'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'players' ? <PlayersTab /> : <ScheduleTab />}
    </div>
  )
}
