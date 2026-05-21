import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/lineup'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === import.meta.env.VITE_PASSWORD) {
      sessionStorage.setItem('fhm_auth', 'true')
      navigate(from, { replace: true })
    } else {
      setError('Ongeldig wachtwoord. Probeer opnieuw.')
      setPassword('')
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#101010' }}>
      {/* Background pattern */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #006847 0, #006847 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px', opacity: 0.08 }}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4">
        {/* AMHC Logo */}
        <div className="text-center mb-7">
          <img
            src="https://irp.cdn-website.com/783c9bc2/dms3rep/multi/amhc-logo.png"
            alt="AMHC"
            className="mx-auto mb-4 object-contain"
            style={{ height: '80px', width: '80px' }}
            onError={e => { e.target.style.display = 'none' }}
          />
          <h1 className="text-xl font-bold text-amhc-black">Team Manager</h1>
          <p className="text-sm text-amhc-gray mt-1">Voer het teamwachtwoord in</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-amhc-gray mb-1.5">
              Wachtwoord
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amhc-green transition-colors font-medium"
              autoFocus
              placeholder="••••••••"
            />
            {error && (
              <p className="text-red-500 text-sm mt-1.5 font-medium">{error}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full text-white font-bold py-3 rounded-xl transition-colors tracking-wide"
            style={{ backgroundColor: '#006847' }}
            onMouseEnter={e => e.target.style.backgroundColor = '#004f36'}
            onMouseLeave={e => e.target.style.backgroundColor = '#006847'}
          >
            Inloggen
          </button>
        </form>

        {/* Bottom accent */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">Alkmaarsche Mixed Hockey Club</p>
        </div>
      </div>
    </div>
  )
}
