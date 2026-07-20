import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'

import { useActiveShifts } from '@/src/hooks/useActiveShifts'
import { useAdminStopShift } from '@/src/hooks/useAdminStopShift'
import { useFamilyMembers } from '@/src/hooks/useFamilyMembers'

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

type ActiveWorkersSectionProps = {
  isAdmin?: boolean
}

export function ActiveWorkersSection({
  isAdmin = false
}: ActiveWorkersSectionProps) {
  const { data: shifts, isLoading, error } = useActiveShifts()
  const { data: members } = useFamilyMembers()
  const stopShiftMutation = useAdminStopShift()

  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!shifts?.length) return

    setNow(Date.now())

    const intervalId = setInterval(() => {
      setNow(Date.now())
    }, 30_000)

    return () => clearInterval(intervalId)
  }, [shifts])

  function handleStopShift(shiftId: string, workerName: string) {
    Alert.alert(
      'Finalizar turno',
      `¿Seguro que quieres finalizar el turno de ${workerName}? Se registrará como finalizado ahora mismo. Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar turno',
          style: 'destructive',
          onPress: () => {
            stopShiftMutation.mutate(
              { shiftId, reason: null },
              {
                onError: () => {
                  Alert.alert('Error', 'No se pudo finalizar el turno.')
                }
              }
            )
          }
        }
      ]
    )
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'No se pudo cargar la información.'
    return (
      <View style={styles.errorCard}>
        <Text style={styles.errorText}>{message}</Text>
      </View>
    )
  }

  if (!shifts?.length) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>Nadie tiene un turno activo en este momento.</Text>
      </View>
    )
  }

  return (
    <View style={styles.list}>
      {shifts.map((shift) => {
        const member = members?.find((m) => m.user_id === shift.worker_id)
        const workerName = member?.full_name ?? 'Trabajador'

        return (
          <View key={shift.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View accessible={false} style={styles.activeDot} />
              <Text style={styles.workerName}>{workerName}</Text>
            </View>

            <View style={styles.details}>
              <View style={styles.detailBlock}>
                <Text style={styles.detailLabel}>Entrada</Text>
                <Text style={styles.detailValue}>
                  {formatTime(shift.started_at)}
                </Text>
              </View>

              <View accessible={false} style={styles.detailDivider} />

              <View style={styles.detailBlock}>
                <Text style={styles.detailLabel}>Total</Text>
                <Text style={styles.detailValue}>
                  {formatDuration(shift.started_at, now)}
                </Text>
              </View>
            </View>

            {isAdmin ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Finalizar turno de ${workerName}`}
                accessibilityState={{ disabled: stopShiftMutation.isPending }}
                disabled={stopShiftMutation.isPending}
                style={({ pressed }) => [
                  styles.stopButton,
                  pressed && styles.stopButtonPressed,
                  stopShiftMutation.isPending && styles.stopButtonDisabled
                ]}
                onPress={() => handleStopShift(shift.id, workerName)}
              >
                <Text style={styles.stopButtonText}>Finalizar turno</Text>
              </Pressable>
            ) : null}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  centered: {
    paddingVertical: 24,
    alignItems: 'center'
  },
  errorCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  errorText: {
    fontSize: 16,
    color: '#B91C1C'
  },
  emptyCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 17,
    color: '#555555',
    textAlign: 'center'
  },
  list: {
    gap: 12
  },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
    overflow: 'hidden'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#BBF7D0'
  },
  activeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#15803D'
  },
  workerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#14532D'
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    paddingTop: 16
  },
  detailBlock: {
    flex: 1,
    gap: 4
  },
  detailDivider: {
    width: 1,
    height: 44,
    backgroundColor: '#BBF7D0',
    marginHorizontal: 16
  },
  detailLabel: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '500'
  },
  detailValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#14532D',
    letterSpacing: -0.3
  },
  stopButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 18,
    marginBottom: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    backgroundColor: '#FFFFFF'
  },
  stopButtonPressed: {
    backgroundColor: '#FEF2F2'
  },
  stopButtonDisabled: {
    opacity: 0.5
  },
  stopButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B91C1C'
  }
})
