import type { Session } from '@supabase/supabase-js'
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import { supabase } from '../lib/supabase'
import { registerForPushNotificationsAsync } from '../services/notifications.service'

type AuthContextValue = {
  session: Session | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error loading session:', error.message)
      }

      if (isMounted) {
        setSession(data.session)
        setIsLoading(false)
      }
    }

    void loadSession()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)

      // Only prompt for notification permission on a genuine interactive
      // sign-in (covers sign-up too, since Supabase fires SIGNED_IN once a
      // session exists) — never on INITIAL_SESSION, which fires when a
      // persisted session is silently restored on app launch.
      if (event === 'SIGNED_IN') {
        void registerForPushNotificationsAsync()
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      isLoading
    }),
    [session, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
