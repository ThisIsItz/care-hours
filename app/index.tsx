import { router } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.title}>FichApp</Text>
          <Text style={styles.subtitle}>
            Registra y consulta las horas de cuidado de forma sencilla.
          </Text>
        </View>

        <View style={styles.buttons}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed
            ]}
            onPress={() => router.navigate('/sign-in')}
          >
            <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed
            ]}
            onPress={() => router.navigate('/sign-up')}
          >
            <Text style={styles.secondaryButtonText}>Crear una cuenta</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 28,
    gap: 48
  },
  hero: {
    gap: 16
  },
  title: {
    fontSize: 44,
    fontWeight: '800',
    color: '#111111',
    textAlign: 'center',
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 30,
    color: '#555555',
    textAlign: 'center'
  },
  buttons: {
    gap: 14
  },
  primaryButton: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#111111'
  },
  primaryButtonPressed: {
    backgroundColor: '#333333'
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700'
  },
  secondaryButton: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D1D5DB'
  },
  secondaryButtonPressed: {
    backgroundColor: '#F9FAFB'
  },
  secondaryButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111111'
  }
})
