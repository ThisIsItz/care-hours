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
      Alert.alert(
        'Contraseña demasiado corta',
        'Utiliza al menos 8 caracteres.'
      )
      return
    }

    try {
      setIsSubmitting(true)

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: normalizedName
          }
        }
      })

      if (error) {
        setFormError(error.message)
        return
      }

      if (!data.session) {
        setSuccessMessage(
          'Cuenta creada. Revisa tu correo para confirmar la cuenta.'
        )
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
        >
          <View style={styles.form}>
            <Text style={styles.title}>Crear una cuenta</Text>

            <FormInput
              label="Nombre"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
            />

            <FormInput
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <View>
              <FormInput
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
              />
              <Text style={styles.helperText}>Al menos 8 caracteres</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              style={[
                styles.primaryButton,
                isSubmitting && styles.disabledButton
              ]}
              onPress={() => void handleSignUp()}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
              </Text>
            </Pressable>
            {formError ? (
              <Text style={styles.errorText}>{formError}</Text>
            ) : null}

            {successMessage ? (
              <Text style={styles.successText}>{successMessage}</Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={() => router.navigate('/sign-in')}
            >
              <Text style={styles.link}>Ya tengo una cuenta</Text>
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
    backgroundColor: '#ffffff'
  },
  keyboardContainer: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24
  },
  form: {
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
  },
  helperText: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280'
  },
  errorText: {
    fontSize: 14,
    color: '#b42318'
  },

  successText: {
    fontSize: 14,
    color: '#067647'
  }
})
