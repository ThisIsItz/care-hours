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
    if (!currentShift) {
      return
    }

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
      {
        text: 'Cancelar',
        style: 'cancel'
      },
      {
        text: 'Terminar turno',
        style: 'destructive',
        onPress: () => {
          void handleEndShift()
        }
      }
    ])
  }

  async function handleEndShift() {
    try {
      await endShiftMutation.mutateAsync()
    } catch (mutationError) {
      Alert.alert(
        'No se pudo terminar el turno',
        getErrorMessage(mutationError)
      )
    }
  }

  if (isLoading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.card}>
        <Text style={styles.errorText}>{getErrorMessage(error)}</Text>
      </View>
    )
  }

  if (!currentShift) {
    return (
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <View style={styles.inactiveIndicator} />

          <Text style={styles.statusText}>No estás trabajando</Text>
        </View>

        <Text style={styles.description}>
          Pulsa el botón cuando empieces tu jornada.
        </Text>

        <Pressable
          accessibilityRole="button"
          disabled={startShiftMutation.isPending}
          style={[
            styles.startButton,
            startShiftMutation.isPending && styles.disabledButton
          ]}
          onPress={() => void handleStartShift()}
        >
          {startShiftMutation.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.startButtonText}>Empezar turno</Text>
          )}
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <View style={styles.statusRow}>
        <View style={styles.activeIndicator} />

        <Text style={styles.statusText}>Estás trabajando</Text>
      </View>

      <View style={styles.details}>
        <View>
          <Text style={styles.detailLabel}>Entrada</Text>
          <Text style={styles.detailValue}>
            {formatTime(currentShift.started_at)}
          </Text>
        </View>

        <View>
          <Text style={styles.detailLabel}>Tiempo trabajado</Text>
          <Text style={styles.detailValue}>
            {formatDuration(currentShift.started_at, now)}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={endShiftMutation.isPending}
        style={[
          styles.endButton,
          endShiftMutation.isPending && styles.disabledButton
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
  card: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 16,
    gap: 20
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  activeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#16803c'
  },
  inactiveIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#777777'
  },
  statusText: {
    fontSize: 19,
    fontWeight: '700'
  },
  description: {
    fontSize: 16,
    lineHeight: 23,
    color: '#555555'
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16
  },
  detailLabel: {
    marginBottom: 5,
    fontSize: 14,
    color: '#666666'
  },
  detailValue: {
    fontSize: 21,
    fontWeight: '700'
  },
  startButton: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#111111'
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700'
  },
  endButton: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#111111',
    borderRadius: 14
  },
  endButtonText: {
    fontSize: 20,
    fontWeight: '700'
  },
  disabledButton: {
    opacity: 0.5
  },
  errorText: {
    fontSize: 14,
    color: '#b42318'
  }
})
