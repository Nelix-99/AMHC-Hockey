import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const authed = sessionStorage.getItem('fhm_auth') === 'true'
  return authed ? children : <Navigate to="/login" replace />
}
