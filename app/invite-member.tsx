import * as Clipboard from 'expo-clipboard'
import { useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useCreateFamilyInvite } from '@/src/hooks/useCreateFamilyInvite'
import type { InviteRole } from '@/src/types/family'

export default function InviteMemberScreen() {
  const [selectedRole, setSelectedRole] = useState<InviteRole>('family')

  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!generatedCode) return
    await Clipboard.setStringAsync(generatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const createInviteMutation = useCreateFamilyInvite()

  async function handleGenerateCode() {
    setGeneratedCode(null)

    try {
      const invite = await createInviteMutation.mutateAsync(selectedRole)

      setGeneratedCode(invite.code)
    } catch (error) {
      console.error('Create invite error:', error)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>Invitar persona</Text>

          <Text style={styles.subtitle}>
            Selecciona qué tipo de acceso tendrá.
          </Text>
        </View>

        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: selectedRole === 'family' }}
          accessibilityLabel="Familiar"
          accessibilityHint="Podrá consultar los turnos y las horas"
          style={[
            styles.roleButton,
            selectedRole === 'family' && styles.selectedRoleButton
          ]}
          onPress={() => { setSelectedRole('family'); setGeneratedCode(null) }}
        >
          <Text style={styles.roleTitle}>Familiar</Text>

          <Text style={styles.roleDescription}>
            Podrá consultar los turnos y las horas.
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: selectedRole === 'worker' }}
          accessibilityLabel="Trabajador"
          accessibilityHint="Podrá fichar entrada y salida"
          style={[
            styles.roleButton,
            selectedRole === 'worker' && styles.selectedRoleButton
          ]}
          onPress={() => { setSelectedRole('worker'); setGeneratedCode(null) }}
        >
          <Text style={styles.roleTitle}>Trabajador</Text>

          <Text style={styles.roleDescription}>
            Podrá fichar entrada y salida.
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Generar código de invitación"
          accessibilityState={{ disabled: createInviteMutation.isPending }}
          disabled={createInviteMutation.isPending}
          style={[
            styles.primaryButton,
            createInviteMutation.isPending && styles.disabledButton
          ]}
          onPress={() => void handleGenerateCode()}
        >
          {createInviteMutation.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Generar código</Text>
          )}
        </Pressable>

        {generatedCode ? (
          <View
            accessibilityLiveRegion="polite"
            style={styles.codeCard}
          >
            <Text style={styles.codeLabel}>Código de invitación</Text>

            <Text
              selectable
              accessibilityLabel={`Código de invitación: ${generatedCode}`}
              style={styles.code}
            >
              {generatedCode}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copied ? 'Código copiado' : 'Copiar código de invitación'}
              style={({ pressed }) => [
                styles.copyButton,
                copied && styles.copyButtonDone,
                pressed && !copied && styles.copyButtonPressed
              ]}
              onPress={() => void handleCopy()}
            >
              <Text style={[styles.copyButtonText, copied && styles.copyButtonTextDone]}>
                {copied ? 'Copiado ✓' : 'Copiar código'}
              </Text>
            </Pressable>

            <Text style={styles.codeHelp}>
              Es válido durante 24 horas y solo puede utilizarse una vez.
            </Text>
          </View>
        ) : null}

        {createInviteMutation.error ? (
          <Text style={styles.errorText}>
            {createInviteMutation.error instanceof Error
              ? createInviteMutation.error.message
              : 'No se pudo generar el código.'}
          </Text>
        ) : null}
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
    padding: 24,
    gap: 16
  },
  title: {
    fontSize: 32,
    fontWeight: '700'
  },
  subtitle: {
    marginTop: 8,
    fontSize: 17,
    color: '#555555'
  },
  roleButton: {
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    gap: 6
  },
  selectedRoleButton: {
    borderWidth: 2,
    borderColor: '#111111'
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700'
  },
  roleDescription: {
    fontSize: 16,
    color: '#555555'
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
  codeCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 10
  },
  codeLabel: {
    fontSize: 16,
    color: '#555555'
  },
  code: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 4
  },
  copyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF'
  },
  copyButtonPressed: {
    backgroundColor: '#F3F4F6'
  },
  copyButtonDone: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4'
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111'
  },
  copyButtonTextDone: {
    color: '#15803D'
  },
  codeHelp: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#555555'
  },
  errorText: {
    fontSize: 16,
    color: '#B91C1C'
  }
})
