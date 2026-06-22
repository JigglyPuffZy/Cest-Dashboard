import { useState, useEffect, createContext, useContext } from 'react'
import { auth } from '../services/supabaseClient'

// Create Auth Context
const AuthContext = createContext({})

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true;
    
    // Add timeout for auth initialization
    const authTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timeout, proceeding without authentication');
        setLoading(false);
        setUser(null);
        setSession(null);
      }
    }, 5000);

    // Get initial session
    auth.getSession().then((result) => {
      if (!mounted) return;
      
      const session = result?.data?.session || null;
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      clearTimeout(authTimeout);
    }).catch((error) => {
      if (!mounted) return;
      
      console.error('Auth initialization error:', error);
      setSession(null);
      setUser(null);
      setLoading(false);
      clearTimeout(authTimeout);
    });

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      mounted = false;
      clearTimeout(authTimeout);
      subscription.unsubscribe();
    }
  }, [])

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const result = await auth.signIn(email, password)
      return result
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await auth.signOut()
    } catch (error) {
      throw error
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
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}