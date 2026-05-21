import { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext(null)

const STORAGE_KEY = 'fhm_v1'

const initialState = {
  players: [],
  matches: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_PLAYER':
      return { ...state, players: [...state.players, action.payload] }

    case 'UPDATE_PLAYER':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        ),
      }

    case 'ARCHIVE_PLAYER':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.id ? { ...p, archived: !p.archived } : p
        ),
      }

    case 'ADD_MATCH':
      return { ...state, matches: [...state.matches, action.payload] }

    case 'UPDATE_MATCH':
      return {
        ...state,
        matches: state.matches.map(m =>
          m.id === action.payload.id ? { ...m, ...action.payload } : m
        ),
      }

    case 'DELETE_MATCH':
      return { ...state, matches: state.matches.filter(m => m.id !== action.id) }

    case 'REPLACE_MATCHES':
      return { ...state, matches: action.payload }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : initialState
    } catch {
      return initialState
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const addPlayer = (player) =>
    dispatch({ type: 'ADD_PLAYER', payload: { ...player, id: crypto.randomUUID(), archived: false, createdAt: Date.now() } })

  const updatePlayer = (player) =>
    dispatch({ type: 'UPDATE_PLAYER', payload: player })

  const toggleArchivePlayer = (id) =>
    dispatch({ type: 'ARCHIVE_PLAYER', id })

  const addMatch = (match) =>
    dispatch({ type: 'ADD_MATCH', payload: { ...match, id: crypto.randomUUID() } })

  const updateMatch = (match) =>
    dispatch({ type: 'UPDATE_MATCH', payload: match })

  const deleteMatch = (id) =>
    dispatch({ type: 'DELETE_MATCH', id })

  const importMatches = (matches) =>
    dispatch({ type: 'REPLACE_MATCHES', payload: matches })

  return (
    <AppContext.Provider value={{ ...state, addPlayer, updatePlayer, toggleArchivePlayer, addMatch, updateMatch, deleteMatch, importMatches }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
