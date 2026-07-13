import { Stack } from 'expo-router'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { AuthProvider, useAuth } from '@/src/contexts/AuthContext'
import { QueryProvider } from '@/src/providers/QueryProvider'

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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="index" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
      </Stack.Protected>

      <Stack.Protected guard={Boolean(session)}>
        <Stack.Screen name="home" />
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
      </Stack.Protected>
    </Stack>
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
