import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, fromDb, toDb } from '../utils/supabase'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  // Initial fetch + real-time subscriptions
  useEffect(() => {
    Promise.all([
      supabase.from('players').select('*').order('created_at'),
      supabase.from('matches').select('*').order('date'),
    ]).then(([{ data: p }, { data: m }]) => {
      if (p) setPlayers(p.map(fromDb.player))
      if (m) setMatches(m.map(fromDb.match))
      setLoading(false)
    })

    const channel = supabase
      .channel('app-data')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'players' }, ({ new: row }) => {
        setPlayers(prev => [...prev.filter(p => p.id !== row.id), fromDb.player(row)])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'players' }, ({ new: row }) => {
        setPlayers(prev => prev.map(p => p.id === row.id ? fromDb.player(row) : p))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'players' }, ({ old: row }) => {
        setPlayers(prev => prev.filter(p => p.id !== row.id))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, ({ new: row }) => {
        setMatches(prev => [...prev.filter(m => m.id !== row.id), fromDb.match(row)])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches' }, ({ new: row }) => {
        setMatches(prev => prev.map(m => m.id === row.id ? fromDb.match(row) : m))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'matches' }, ({ old: row }) => {
        setMatches(prev => prev.filter(m => m.id !== row.id))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const addPlayer = async (player) => {
    const row = toDb.player({ ...player, id: crypto.randomUUID(), archived: false })
    await supabase.from('players').insert(row)
  }

  const updatePlayer = async (player) => {
    await supabase.from('players').update(toDb.player(player)).eq('id', player.id)
  }

  const toggleArchivePlayer = async (id) => {
    const player = players.find(p => p.id === id)
    if (!player) return
    await supabase.from('players').update({ archived: !player.archived }).eq('id', id)
  }

  const addMatch = async (match) => {
    const row = toDb.match({ ...match, id: crypto.randomUUID() })
    await supabase.from('matches').insert(row)
  }

  const updateMatch = async (match) => {
    await supabase.from('matches').update(toDb.matchPartial(match)).eq('id', match.id)
  }

  const deleteMatch = async (id) => {
    await supabase.from('matches').delete().eq('id', id)
  }

  const importMatches = async (newMatches) => {
    const rows = newMatches.map(m => toDb.match({ ...m, id: m.id || crypto.randomUUID() }))
    await supabase.from('matches').insert(rows)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f9fafb' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amhc-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={{ players, matches, addPlayer, updatePlayer, toggleArchivePlayer, addMatch, updateMatch, deleteMatch, importMatches }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
