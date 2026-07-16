import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'

import { useCurrentShift } from '@/src/hooks/useCurrentShift'
import { useEndShift } from '@/src/hooks/useEndShift'
import { useStartShift } from '@/src/hooks/useStartShift'

function formatTime(date: string) {
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

function formatDuration(startedAt: string, now: number) {
  const elapsedMilliseconds = now - new Date(startedAt).getTime()
  const totalMinutes = Math.max(0, Math.floor(elapsedMilliseconds / 60_000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) {
    return `${minutes} min`
  }

  return `${hours} h ${minutes.toString().padStart(2, '0')} min`
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Ha ocurrido un error.'
}

export function WorkerShiftCard() {
  const { data: currentShift, isLoading, error } = useCurrentShift()

  const startShiftMutation = useStartShift()
  const endShiftMutation = useEndShift()

  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!currentShift) return

    setNow(Date.now())

    const intervalId = setInterval(() => {
      setNow(Date.now())
    }, 30_000)

    return () => clearInterval(intervalId)
  }, [currentShift])

  async function handleStartShift() {
    try {
      await startShiftMutation.mutateAsync()
    } catch (mutationError) {
      Alert.alert('No se pudo iniciar el turno', getErrorMessage(mutationError))
    }
  }

  function confirmEndShift() {
    Alert.alert('Terminar turno', '¿Quieres registrar la salida ahora?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Terminar turno',
        style: 'destructive',
        onPress: () => { void handleEndShift() }
      }
    ])
  }

  async function handleEndShift() {
    try {
      await endShiftMutation.mutateAsync()
    } catch (mutationError) {
      Alert.alert('No se pudo terminar el turno', getErrorMessage(mutationError))
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingCard}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Cargando…</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorCard}>
        <Text style={styles.errorText}>{getErrorMessage(error)}</Text>
      </View>
    )
  }

  if (!currentShift) {
    return (
      <View style={styles.inactiveCard}>
        <View style={styles.statusRow}>
          <View style={styles.inactiveDot} />
          <Text style={styles.statusText}>No estás trabajando</Text>
        </View>

        <Text style={styles.description}>
          Pulsa el botón cuando empieces tu jornada.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityHint="Inicia tu turno de trabajo"
          android_ripple={{ color: '#ffffff22' }}
          disabled={startShiftMutation.isPending}
          style={({ pressed }) => [
            styles.startButton,
            startShiftMutation.isPending && styles.buttonDisabled,
            pressed && styles.startButtonPressed
          ]}
          onPress={() => void handleStartShift()}
        >
          {startShiftMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.startButtonText}>Empezar turno</Text>
          )}
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.activeCard}>
      <View style={styles.activeHeader}>
        <View style={styles.activeDot} />
        <Text style={styles.activeStatusText}>Estás trabajando</Text>
      </View>

      <View style={styles.timeGrid}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Entrada</Text>
          <Text style={styles.timeValue}>{formatTime(currentShift.started_at)}</Text>
        </View>

        <View style={styles.timeDivider} />

        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Llevas</Text>
          <Text style={styles.timeValue}>{formatDuration(currentShift.started_at, now)}</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityHint="Registra la salida del turno"
        android_ripple={{ color: '#11111122' }}
        disabled={endShiftMutation.isPending}
        style={({ pressed }) => [
          styles.endButton,
          endShiftMutation.isPending && styles.buttonDisabled,
          pressed && styles.endButtonPressed
        ]}
        onPress={confirmEndShift}
      >
        {endShiftMutation.isPending ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.endButtonText}>Terminar turno</Text>
        )}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  loadingCard: {
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    gap: 12
  },
  loadingText: {
    fontSize: 17,
    color: '#6B7280'
  },
  errorCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  errorText: {
    fontSize: 16,
    color: '#B91C1C'
  },
  // Inactive state
  inactiveCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 20
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  inactiveDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#9CA3AF'
  },
  statusText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111'
  },
  description: {
    fontSize: 17,
    lineHeight: 26,
    color: '#555555'
  },
  startButton: {
    minHeight: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#15803D'
  },
  startButtonPressed: {
    backgroundColor: '#166534',
    transform: [{ scale: 0.98 }]
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700'
  },
  // Active state
  activeCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
    overflow: 'hidden',
    gap: 0
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#BBF7D0'
  },
  activeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#15803D'
  },
  activeStatusText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#14532D'
  },
  timeGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingVertical: 28,
    gap: 0
  },
  timeBlock: {
    flex: 1,
    gap: 6
  },
  timeDivider: {
    width: 1,
    height: 56,
    backgroundColor: '#BBF7D0',
    marginHorizontal: 16
  },
  timeLabel: {
    fontSize: 15,
    color: '#166534',
    fontWeight: '500'
  },
  timeValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#14532D',
    letterSpacing: -0.5
  },
  endButton: {
    minHeight: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1.5,
    borderTopColor: '#BBF7D0',
    backgroundColor: '#FFFFFF'
  },
  endButtonPressed: {
    backgroundColor: '#F9FAFB'
  },
  endButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111'
  },
  buttonDisabled: {
    opacity: 0.5
  }
})
