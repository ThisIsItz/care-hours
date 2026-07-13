import { router } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Care Hours</Text>

        <Text style={styles.subtitle}>
          Registra y consulta las horas de cuidado de forma sencilla.
        </Text>

        <Pressable
          accessibilityRole="button"
          style={styles.primaryButton}
          onPress={() => router.navigate('/sign-in')}
        >
          <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={styles.secondaryButton}
          onPress={() => router.navigate('/sign-up')}
        >
          <Text style={styles.secondaryButtonText}>Crear una cuenta</Text>
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
    padding: 24,
    gap: 16
  },
  title: {
    fontSize: 38,
    fontWeight: '700',
    textAlign: 'center'
  },
  subtitle: {
    marginBottom: 24,
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center'
  },
  primaryButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#111111',
    paddingHorizontal: 20
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600'
  },
  secondaryButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#111111',
    paddingHorizontal: 20
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600'
  }
})
