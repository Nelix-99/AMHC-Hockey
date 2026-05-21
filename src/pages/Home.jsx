import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const MONTHS = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec']

function parseDate(iso) {
  const [, m, d] = iso.split('-')
  return { day: String(Number(d)), month: MONTHS[Number(m) - 1] }
}

export default function Home() {
  const { players, matches } = useApp()
  const authed = sessionStorage.getItem('fhm_auth') === 'true'

  const today = new Date().toISOString().slice(0, 10)
  const activePlayers = players.filter(p => !p.archived)
  const upcomingMatches = matches
    .filter(m => m.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3)
  const recentResults = matches
    .filter(m => m.date < today && m.scoreHome !== null)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: '#101010' }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #006847 0, #006847 1px, transparent 0, transparent 50%)', backgroundSize: '24px 24px' }}
        />
        <div className="relative flex items-center gap-4 p-6">
          <img
            src="https://irp.cdn-website.com/783c9bc2/dms3rep/multi/amhc-logo.png"
            alt="AMHC"
            className="object-contain shrink-0"
            style={{ height: '56px', width: '56px' }}
            onError={e => { e.target.style.display = 'none' }}
          />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-tight">AMHC Team Manager</h1>
            <p className="text-sm font-medium mt-0.5" style={{ color: '#8aba9f' }}>Alkmaarse Mixed Hockey Club</p>
            {authed && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className="inline-block text-xs font-bold px-2.5 py-1 rounded-full text-white tracking-wide"
                  style={{ backgroundColor: '#006847' }}
                >
                  MO-9 Wit
                </span>
                <a
                  href="https://chat.whatsapp.com/Ksq237wi7gK2rEdD0ETp5D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full text-white transition-opacity hover:opacity-85"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.057 23.267a.75.75 0 0 0 .921.921l5.444-1.474A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.7-.502-5.25-1.381l-.374-.217-3.882 1.051 1.054-3.85-.225-.381A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  Groepschat
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Not logged in — login prompt only */}
      {!authed && (
        <div className="bg-white border-l-4 rounded-xl p-5 flex items-center justify-between shadow-sm" style={{ borderColor: '#006847' }}>
          <div>
            <p className="font-bold text-amhc-black text-sm">Inloggen voor teamfuncties</p>
            <p className="text-xs text-amhc-gray mt-0.5">Toegang tot opstelling, wedstrijden en beheer</p>
          </div>
          <Link to="/login" className="text-white px-4 py-2 rounded-xl font-bold text-sm shrink-0 transition-colors"
            style={{ backgroundColor: '#006847' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#004f36'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#006847'}>
            Inloggen
          </Link>
        </div>
      )}

      {/* Logged in — full dashboard */}
      {authed && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Spelers',     value: activePlayers.length,  color: '#006847' },
              { label: 'Wedstrijden', value: matches.length,         color: '#3b82f6' },
              { label: 'Aankomend',   value: upcomingMatches.length, color: '#f97316' },
              { label: 'Uitslagen',   value: recentResults.length,   color: '#a855f7' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl shadow-sm p-3 text-center" style={{ borderTop: `3px solid ${stat.color}` }}>
                <div className="text-xl font-bold text-amhc-black">{stat.value}</div>
                <div className="text-[10px] text-amhc-gray font-semibold uppercase tracking-wide mt-0.5 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-5">

            {/* Upcoming matches */}
            <div className="card">
              <h2 className="font-bold text-amhc-black mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#006847' }} />
                Aankomende wedstrijden
              </h2>
              {upcomingMatches.length === 0 ? (
                <p className="text-sm text-gray-400">Nog geen wedstrijden gepland.</p>
              ) : (
                <ul className="space-y-2">
                  {upcomingMatches.map(m => {
                    const { day, month } = parseDate(m.date)
                    return (
                      <li key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex-shrink-0 w-11 text-center rounded-lg py-1.5" style={{ backgroundColor: '#006847' }}>
                          <div className="text-lg font-bold text-white leading-none">{day}</div>
                          <div className="text-[9px] font-bold uppercase tracking-wide" style={{ color: '#a3d4bc' }}>{month}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-amhc-black text-sm truncate">{m.opponent || 'TBD'}</p>
                          {m.location && <p className="text-[10px] text-gray-400 truncate">{m.location}</p>}
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-md font-bold shrink-0 ${m.isHome ? 'bg-[#0068471a] text-amhc-green' : 'bg-blue-50 text-blue-700'}`}>
                          {m.isHome ? 'Thuis' : 'Uit'}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
              <Link to="/admin" className="mt-3 text-xs font-semibold hover:underline block" style={{ color: '#006847' }}>
                Programma beheren →
              </Link>
            </div>

            {/* Recent results */}
            <div className="card">
              <h2 className="font-bold text-amhc-black mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#006847' }} />
                Recente uitslagen
              </h2>
              {recentResults.length === 0 ? (
                <p className="text-sm text-gray-400">Nog geen uitslagen ingevoerd.</p>
              ) : (
                <ul className="space-y-2">
                  {recentResults.map(m => {
                    const ourGoals = m.isHome ? m.scoreHome : m.scoreAway
                    const theirGoals = m.isHome ? m.scoreAway : m.scoreHome
                    const result = ourGoals > theirGoals ? 'W' : ourGoals < theirGoals ? 'V' : 'G'
                    const { day, month } = parseDate(m.date)
                    const bg = result === 'W' ? '#006847' : result === 'V' ? '#ef4444' : '#9ca3af'
                    return (
                      <li key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: bg }}>
                          {result}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-amhc-black text-sm truncate">{m.opponent}</p>
                          <p className="text-[10px] text-gray-400">{day} {month}</p>
                        </div>
                        <span className="font-mono font-bold text-amhc-black text-base">{m.scoreHome}–{m.scoreAway}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
              <Link to="/matches" className="mt-3 text-xs font-semibold hover:underline block" style={{ color: '#006847' }}>
                Alle statistieken →
              </Link>
            </div>
          </div>

          <div className="mt-6 flex gap-3 flex-wrap">
            <Link to="/lineup" className="btn-primary">Opstelling openen</Link>
            <Link to="/admin" className="btn-secondary">Team beheren</Link>
          </div>
        </>
      )}
    </div>
  )
}
