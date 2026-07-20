import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query'
import { type PropsWithChildren, useEffect, useState } from 'react'
import { AppState, type AppStateStatus } from 'react-native'

export function QueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1
          },
          mutations: {
            retry: 0
          }
        }
      })
  )

  // React Native has no `window` focus/visibility events, so
  // `refetchOnWindowFocus` is a no-op unless we drive TanStack Query's
  // focusManager from AppState ourselves — this makes queries refetch when
  // the app returns to the foreground.
  useEffect(() => {
    function onAppStateChange(status: AppStateStatus) {
      focusManager.setFocused(status === 'active')
    }

    const subscription = AppState.addEventListener('change', onAppStateChange)

    return () => {
      subscription.remove()
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
