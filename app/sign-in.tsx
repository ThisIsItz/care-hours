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

import { FormInput } from '../src/components/FormInput'
import { LegalLinksRow } from '../src/components/LegalLinksRow'
import { supabase } from '../src/lib/supabase'

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

          <View style={styles.form}>
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
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.primaryButton,
                isSubmitting && styles.disabledButton,
                pressed && styles.primaryButtonPressed
              ]}
              onPress={() => void handleSignIn()}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              style={styles.linkRow}
              onPress={() => router.navigate('/sign-up')}
            >
              <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
            </Pressable>

            <LegalLinksRow />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  keyboardContainer: {
    flex: 1
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 28,
    gap: 32
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#111111'
  },
  form: {
    gap: 20
  },
  actions: {
    gap: 16
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
  disabledButton: {
    opacity: 0.5
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700'
  },
  linkRow: {
    alignItems: 'center',
    paddingVertical: 12
  },
  linkText: {
    fontSize: 17,
    color: '#555555'
  }
})
