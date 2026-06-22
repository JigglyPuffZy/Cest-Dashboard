import { useState, useEffect, createContext, useContext } from 'react'
import { auth } from '../services/supabaseClient'

export const SESSION_KEYS = {
  GUEST_MODE: 'cest_guest_mode',
}

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGuestMode, setIsGuestMode] = useState(false)

  useEffect(() => {
    let mounted = true

    const authTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timeout, proceeding without authentication')
        setLoading(false)
      }
    }, 5000)

    const guestActive = sessionStorage.getItem(SESSION_KEYS.GUEST_MODE) === '1'
    if (guestActive) {
      setIsGuestMode(true)
      setUser(null)
      setSession(null)
      setLoading(false)
      clearTimeout(authTimeout)
      return () => {
        mounted = false
        clearTimeout(authTimeout)
      }
    }

    auth.getSession().then((activeSession) => {
      if (!mounted) return
      setSession(activeSession)
      setUser(activeSession?.user ?? null)
      setLoading(false)
      clearTimeout(authTimeout)
    }).catch((error) => {
      if (!mounted) return
      console.error('Auth initialization error:', error)
      setSession(null)
      setUser(null)
      setLoading(false)
      clearTimeout(authTimeout)
    })

    const { data: { subscription } } = auth.onAuthStateChange((_event, activeSession) => {
      if (!mounted) return
      if (sessionStorage.getItem(SESSION_KEYS.GUEST_MODE) === '1') return
      setSession(activeSession)
      setUser(activeSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      clearTimeout(authTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const enterGuestMode = () => {
    sessionStorage.setItem(SESSION_KEYS.GUEST_MODE, '1')
    setIsGuestMode(true)
    setUser(null)
    setSession(null)
    setLoading(false)
  }

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      sessionStorage.removeItem(SESSION_KEYS.GUEST_MODE)
      setIsGuestMode(false)
      const result = await auth.signIn(email, password)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      sessionStorage.removeItem(SESSION_KEYS.GUEST_MODE)
      setIsGuestMode(false)
      if (user || session) {
        await auth.signOut()
      }
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    enterGuestMode,
    isGuestMode,
    isReadOnly: isGuestMode,
    isAuthenticated: !!user,
    canAccessApp: !!user || isGuestMode,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
