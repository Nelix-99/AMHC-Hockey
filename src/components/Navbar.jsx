import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const links = [
  { to: '/',        label: 'Home',        public: true },
  { to: '/lineup',  label: 'Opstelling' },
  { to: '/matches', label: 'Wedstrijden' },
  { to: '/admin',   label: 'Beheer' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const authed = sessionStorage.getItem('fhm_auth') === 'true'
  const [open, setOpen] = useState(false)

  const logout = () => {
    sessionStorage.removeItem('fhm_auth')
    navigate('/login')
    setOpen(false)
  }

  const visibleLinks = links.filter(({ public: pub }) => pub || authed)

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
      isActive ? 'bg-brand-green text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'
    }`

  return (
    <nav style={{ backgroundColor: '#101010' }} className="shadow-lg relative z-40">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
          <img
            src="https://irp.cdn-website.com/783c9bc2/dms3rep/multi/amhc-logo.png"
            alt="AMHC logo"
            className="h-9 w-9 object-contain flex-shrink-0"
            onError={e => { e.target.style.display = 'none' }}
          />
          <span className="text-white font-bold text-lg tracking-wide hidden sm:block">AMHC</span>
        </NavLink>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {visibleLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={linkClass}>{label}</NavLink>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:block shrink-0">
          {authed ? (
            <button onClick={logout} className="text-sm text-gray-400 hover:text-white transition-colors font-medium">
              Uitloggen
            </button>
          ) : (
            <NavLink to="/login" className="text-sm bg-brand-green hover:bg-brand-dark text-white px-3 py-1.5 rounded-lg font-semibold transition-colors">
              Inloggen
            </NavLink>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Menu sluiten' : 'Menu openen'}
        >
          <span className={`block w-5 h-0.5 bg-white transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white transition-all ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          style={{ backgroundColor: '#101010' }}
          className="md:hidden absolute top-full left-0 right-0 border-t border-white/10 px-3 py-3 flex flex-col gap-1 shadow-xl"
        >
          {visibleLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          <div className="border-t border-white/10 mt-2 pt-2">
            {authed ? (
              <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white font-medium rounded-lg hover:bg-white/10 transition-colors">
                Uitloggen
              </button>
            ) : (
              <NavLink to="/login" onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm bg-brand-green text-white rounded-lg font-semibold text-center">
                Inloggen
              </NavLink>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
