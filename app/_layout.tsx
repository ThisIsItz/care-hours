import { Stack } from 'expo-router'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { AuthProvider, useAuth } from '@/src/contexts/AuthContext'
import { useRealtimeShifts } from '@/src/hooks/useRealtimeShifts'
import { useRegisterPushNotifications } from '@/src/hooks/useRegisterPushNotifications'
import { QueryProvider } from '@/src/providers/QueryProvider'

// Mounted only while a session exists, and only once for the whole app —
// keeps the shifts realtime subscription alive across every authenticated
// screen without re-subscribing on navigation.
function AuthenticatedRealtimeSync() {
  useRealtimeShifts()
  return null
}

// Keeps listening for native push-token rotation for the life of the
// session (the initial permission prompt + registration happens on
// SIGNED_IN in AuthContext, and again on a worker's first shift start).
function AuthenticatedPushSync() {
  useRegisterPushNotifications()
  return null
}

function RootNavigator() {
  const { session, isLoading } = useAuth()

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <>
      {session ? (
        <>
          <AuthenticatedRealtimeSync />
          <AuthenticatedPushSync />
        </>
      ) : null}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="index" />
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="sign-up" />
        </Stack.Protected>

        <Stack.Protected guard={Boolean(session)}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="create-family"
            options={{
              headerShown: false,
              presentation: 'card'
            }}
          />
          <Stack.Screen
            name="invite-member"
            options={{
              headerShown: true,
              title: 'Invitar persona'
            }}
          />
          <Stack.Screen
            name="join-family"
            options={{
              headerShown: true,
              title: 'Unirme a un grupo'
            }}
          />
          <Stack.Screen
            name="shift-history"
            options={{
              headerShown: true,
              title: 'Historial'
            }}
          />
          <Stack.Screen
            name="edit-shift"
            options={{
              headerShown: true,
              title: 'Editar turno'
            }}
          />
          <Stack.Screen
            name="add-shift"
            options={{
              headerShown: true,
              title: 'Añadir turno'
            }}
          />
        </Stack.Protected>
      </Stack>
    </>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </QueryProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
