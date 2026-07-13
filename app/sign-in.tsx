import { router } from 'expo-router'
import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'
import { FormInput } from '../components/FormInput'
import { supabase } from '../lib/supabase'

export default function SignInScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSignIn() {
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      Alert.alert('Faltan datos', 'Introduce el correo y la contraseña.')
      return
    }

    try {
      setIsSubmitting(true)

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      })

      if (error) {
        Alert.alert('No se pudo iniciar sesión', error.message)
        return
      }

      router.replace('/home')
    } catch {
      Alert.alert('Ha ocurrido un error', 'Vuelve a intentarlo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Iniciar sesión</Text>

          <FormInput
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            placeholder="nombre@ejemplo.com"
          />

          <FormInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            placeholder="Tu contraseña"
          />

          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            style={[
              styles.primaryButton,
              isSubmitting && styles.disabledButton
            ]}
            onPress={() => void handleSignIn()}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.navigate('/sign-up')}
          >
            <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  keyboardContainer: {
    flex: 1
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 20
  },
  title: {
    marginBottom: 12,
    fontSize: 32,
    fontWeight: '700'
  },
  primaryButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#111111'
  },
  disabledButton: {
    opacity: 0.5
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600'
  },
  link: {
    paddingVertical: 10,
    textAlign: 'center',
    fontSize: 16,
    textDecorationLine: 'underline'
  }
})
