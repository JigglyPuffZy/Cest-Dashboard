import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { auth } from '../services/supabaseClient'
import { accessRequestService } from '../services/accessRequestService'

export const SESSION_KEYS = {
  GUEST_MODE: 'cest_guest_mode',
}

export function getUserDisplayName(user) {
  if (!user) return 'Administrator'
  const meta = user.user_metadata?.full_name || user.user_metadata?.name
  if (meta) return String(meta).split(' ')[0]
  const email = user.email || ''
  const local = email.split('@')[0] || 'Administrator'
  return local.charAt(0).toUpperCase() + local.slice(1)
}

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGuestMode, setIsGuestMode] = useState(false)
  const [guestProfile, setGuestProfile] = useState(null)

  const refreshGuestProfile = useCallback(async () => {
    const synced = await accessRequestService.syncGuestProfileFromServer()
    setGuestProfile(synced ?? accessRequestService.getGuestProfile())
  }, [])

  useEffect(() => {
    let mounted = true

    const authTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timeout, proceeding without authentication')
        setLoading(false)
      }
    }, 5000)

    const initAuth = async () => {
      const guestActive = sessionStorage.getItem(SESSION_KEYS.GUEST_MODE) === '1'
      if (guestActive) {
        const synced = await accessRequestService.syncGuestProfileFromServer()
        if (!mounted) return
        setIsGuestMode(true)
        setGuestProfile(synced ?? accessRequestService.getGuestProfile())
        setUser(null)
        setSession(null)
        setLoading(false)
        clearTimeout(authTimeout)
        return
      }

      try {
        const activeSession = await auth.getSession()
        if (!mounted) return
        setSession(activeSession)
        setUser(activeSession?.user ?? null)
      } catch (error) {
        if (!mounted) return
        console.error('Auth initialization error:', error)
        setSession(null)
        setUser(null)
      } finally {
        if (mounted) {
          setLoading(false)
          clearTimeout(authTimeout)
        }
      }
    }

    initAuth()

    const { data: { subscription } } = auth.onAuthStateChange((_event, activeSession) => {
      if (!mounted) return

      if (activeSession?.user) {
        sessionStorage.removeItem(SESSION_KEYS.GUEST_MODE)
        accessRequestService.setGuestProfile(null)
        setIsGuestMode(false)
        setGuestProfile(null)
        setSession(activeSession)
        setUser(activeSession.user)
        setLoading(false)
        return
      }

      if (sessionStorage.getItem(SESSION_KEYS.GUEST_MODE) === '1') {
        refreshGuestProfile()
        return
      }

      setSession(activeSession)
      setUser(activeSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      clearTimeout(authTimeout)
      subscription.unsubscribe()
    }
  }, [refreshGuestProfile, loading])

  const startGuestSession = () => {
    sessionStorage.setItem(SESSION_KEYS.GUEST_MODE, '1')
    setIsGuestMode(true)
    setGuestProfile(null)
    setUser(null)
    setSession(null)
    setLoading(false)
  }

  const submitGuestAccessRequest = async (firstName, lastName) => {
    const request = await accessRequestService.submitRequest(firstName, lastName)
    sessionStorage.setItem(SESSION_KEYS.GUEST_MODE, '1')
    const profile = {
      requestId: request.id,
      accessToken: request.accessToken,
      firstName: request.firstName,
      lastName: request.lastName,
      fullName: request.fullName,
      status: request.status,
    }
    accessRequestService.setGuestProfile(profile)
    setGuestProfile(profile)
    setIsGuestMode(true)
    setUser(null)
    setSession(null)
    setLoading(false)
    return request
  }

  const enterGuestMode = () => {
    const profile = accessRequestService.getGuestProfile()
    if (!profile || profile.status !== 'approved') {
      throw new Error('Approved guest profile required')
    }
    sessionStorage.setItem(SESSION_KEYS.GUEST_MODE, '1')
    setGuestProfile(profile)
    setIsGuestMode(true)
    setUser(null)
    setSession(null)
    setLoading(false)
  }

  const exitGuestMode = () => {
    sessionStorage.removeItem(SESSION_KEYS.GUEST_MODE)
    accessRequestService.setGuestProfile(null)
    setIsGuestMode(false)
    setGuestProfile(null)
    setUser(null)
    setSession(null)
    setLoading(false)
  }

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      sessionStorage.removeItem(SESSION_KEYS.GUEST_MODE)
      accessRequestService.setGuestProfile(null)
      setIsGuestMode(false)
      setGuestProfile(null)
      const result = await auth.signIn(email, password)
      const activeSession = result?.session ?? null
      if (activeSession) {
        setSession(activeSession)
        setUser(activeSession.user ?? result?.user ?? null)
      }
      return result
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      sessionStorage.removeItem(SESSION_KEYS.GUEST_MODE)
      accessRequestService.setGuestProfile(null)
      setIsGuestMode(false)
      setGuestProfile(null)
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

  const guestNeedsProfile = isGuestMode && !guestProfile?.requestId
  const guestAccessStatus = guestProfile?.status ?? null
  const isAuthenticated = !!user
  const isAdmin = isAuthenticated && !isGuestMode
  const canViewData = isAdmin || (isGuestMode && guestAccessStatus === 'approved')
  const isReadOnly = isGuestMode && guestAccessStatus === 'approved'

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    startGuestSession,
    enterGuestMode,
    exitGuestMode,
    submitGuestAccessRequest,
    refreshGuestProfile,
    isGuestMode,
    guestProfile,
    guestNeedsProfile,
    guestAccessStatus,
    isReadOnly,
    isAuthenticated,
    isAdmin,
    canViewData,
    canAccessApp: isAuthenticated || isGuestMode,
    displayName: isGuestMode
      ? guestProfile?.firstName || 'Guest'
      : getUserDisplayName(user),
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
