import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function HomeScreen() {
  const { session } = useAuth()

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      Alert.alert('No se pudo cerrar la sesión', error.message)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Sesión iniciada</Text>

        <Text style={styles.title}>Supabase funciona 🎉</Text>

        <Text style={styles.email}>{session?.user.email}</Text>

        <Pressable
          accessibilityRole="button"
          style={styles.button}
          onPress={() => void handleSignOut()}
        >
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24
  },
  eyebrow: {
    marginBottom: 8,
    fontSize: 16
  },
  title: {
    fontSize: 32,
    fontWeight: '700'
  },
  email: {
    marginTop: 12,
    marginBottom: 32,
    fontSize: 17
  },
  button: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#111111'
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600'
  }
})
