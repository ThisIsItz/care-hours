import { router } from 'expo-router'
import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { FormInput } from '../src/components/FormInput'
import { supabase } from '../src/lib/supabase'

export default function SignUpScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleSignUp() {
    const normalizedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedName || !normalizedEmail || !password) {
      Alert.alert('Faltan datos', 'Completa todos los campos.')
      return
    }

    if (password.length < 8) {
      Alert.alert('Contraseña demasiado corta', 'Utiliza al menos 8 caracteres.')
      return
    }

    try {
      setIsSubmitting(true)
      setFormError(null)

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { full_name: normalizedName }
        }
      })

      if (error) {
        setFormError(error.message)
        return
      }

      if (!data.session) {
        setSuccessMessage('Cuenta creada. Revisa tu correo para confirmar la cuenta.')
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
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Crear una cuenta</Text>

          <View style={styles.form}>
            <FormInput
              label="Nombre"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              placeholder="Tu nombre completo"
            />

            <FormInput
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              placeholder="nombre@ejemplo.com"
            />

            <View style={styles.passwordField}>
              <FormInput
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                placeholder="Mínimo 8 caracteres"
              />
              <Text style={styles.helperText}>La contraseña debe tener al menos 8 caracteres</Text>
            </View>
          </View>

          <View style={styles.actions}>
            {formError ? (
              <View accessibilityLiveRegion="assertive" style={styles.errorBox}>
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            ) : null}

            {successMessage ? (
              <View accessibilityLiveRegion="polite" style={styles.successBox}>
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.primaryButton,
                isSubmitting && styles.disabledButton,
                pressed && styles.primaryButtonPressed
              ]}
              onPress={() => void handleSignUp()}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              style={styles.linkRow}
              onPress={() => router.navigate('/sign-in')}
            >
              <Text style={styles.linkText}>Ya tengo una cuenta</Text>
            </Pressable>
          </View>
        </ScrollView>
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
    flexGrow: 1,
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
  passwordField: {
    gap: 8
  },
  helperText: {
    fontSize: 15,
    color: '#555555',
    paddingHorizontal: 2
  },
  actions: {
    gap: 14
  },
  errorBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  errorText: {
    fontSize: 16,
    color: '#B91C1C'
  },
  successBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0'
  },
  successText: {
    fontSize: 16,
    color: '#15803D'
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
