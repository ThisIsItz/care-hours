import { router } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { LegalLinksRow } from '@/src/components/LegalLinksRow'
import { useDeleteAccount } from '@/src/hooks/useDeleteAccount'
import { supabase } from '@/src/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

export default function SettingsScreen() {
  const queryClient = useQueryClient()
  const deleteAccountMutation = useDeleteAccount()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    try {
      setIsSigningOut(true)
      const { error } = await supabase.auth.signOut()

      if (error) {
        Alert.alert('No se pudo cerrar sesión', error.message)
        return
      }

      queryClient.clear()
      router.replace('/')
    } finally {
      setIsSigningOut(false)
    }
  }

  function confirmSignOut() {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => void handleSignOut()
      }
    ])
  }

  function handleDeleteAccount() {
    deleteAccountMutation.mutate(undefined, {
      onSuccess: async () => {
        await supabase.auth.signOut()
        router.replace('/')
      },
      onError: (error) => {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo eliminar la cuenta.'
        Alert.alert('No se pudo eliminar la cuenta', message)
      }
    })
  }

  function confirmDeleteAccount() {
    Alert.alert(
      'Eliminar cuenta',
      'Esta acción eliminará tu cuenta de forma permanente y no se puede deshacer. ¿Seguro que quieres continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar cuenta',
          style: 'destructive',
          onPress: () => void handleDeleteAccount()
        }
      ]
    )
  }

  const isBusy = isSigningOut || deleteAccountMutation.isPending

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Ajustes</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.legalCard}>
            <LegalLinksRow />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            accessibilityState={{ disabled: isBusy }}
            disabled={isBusy}
            style={({ pressed }) => [
              styles.signOutButton,
              isBusy && styles.buttonDisabled,
              pressed && !isBusy && styles.signOutButtonPressed
            ]}
            onPress={confirmSignOut}
          >
            {isSigningOut ? (
              <ActivityIndicator color="#111111" />
            ) : (
              <Text style={styles.signOutButtonText}>Cerrar sesión</Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Eliminar cuenta"
            accessibilityState={{ disabled: isBusy }}
            disabled={isBusy}
            style={({ pressed }) => [
              styles.deleteAccountButton,
              isBusy && styles.buttonDisabled,
              pressed && !isBusy && styles.deleteAccountButtonPressed
            ]}
            onPress={confirmDeleteAccount}
          >
            {deleteAccountMutation.isPending ? (
              <ActivityIndicator color="#B91C1C" />
            ) : (
              <Text style={styles.deleteAccountButtonText}>
                Eliminar cuenta
              </Text>
            )}
          </Pressable>

          <Text style={styles.deleteAccountHint}>
            Se eliminará tu cuenta de forma permanente. Esta acción no se
            puede deshacer.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  content: {
    flexGrow: 1,
    padding: 24,
    gap: 32
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111111'
  },
  section: {
    gap: 14
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111'
  },
  legalCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB'
  },
  signOutButton: {
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D1D5DB'
  },
  signOutButtonPressed: {
    backgroundColor: '#F9FAFB'
  },
  signOutButtonText: {
    fontSize: 19,
    fontWeight: '600',
    color: '#111111'
  },
  deleteAccountButton: {
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2'
  },
  deleteAccountButtonPressed: {
    backgroundColor: '#FEE2E2'
  },
  deleteAccountButtonText: {
    fontSize: 19,
    fontWeight: '600',
    color: '#B91C1C'
  },
  deleteAccountHint: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280'
  },
  buttonDisabled: {
    opacity: 0.5
  }
})
