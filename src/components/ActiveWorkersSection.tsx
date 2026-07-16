import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

import { useActiveShifts } from '@/src/hooks/useActiveShifts'
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

export function ActiveWorkersSection() {
  const { data: shifts, isLoading, error } = useActiveShifts()
  const { data: members } = useFamilyMembers()

  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!shifts?.length) return

    setNow(Date.now())

    const intervalId = setInterval(() => {
      setNow(Date.now())
    }, 30_000)

    return () => clearInterval(intervalId)
  }, [shifts])

  if (isLoading) {
    return <ActivityIndicator />
  }

  if (error) {
    const message =
      error instanceof Error ? error.message : 'No se pudo cargar la información.'
    return <Text style={styles.errorText}>{message}</Text>
  }

  if (!shifts?.length) {
    return <Text style={styles.emptyText}>Nadie está trabajando ahora mismo.</Text>
  }

  return (
    <View style={styles.list}>
      {shifts.map((shift) => {
        const member = members?.find((m) => m.user_id === shift.worker_id)
        const workerName = member?.full_name ?? 'Trabajador'

        return (
          <View key={shift.id} style={styles.card}>
            <View style={styles.statusRow}>
              <View style={styles.activeIndicator} />
              <Text style={styles.workerName}>{workerName}</Text>
            </View>

            <View style={styles.details}>
              <View>
                <Text style={styles.detailLabel}>Entrada</Text>
                <Text style={styles.detailValue}>{formatTime(shift.started_at)}</Text>
              </View>

              <View>
                <Text style={styles.detailLabel}>Tiempo trabajado</Text>
                <Text style={styles.detailValue}>{formatDuration(shift.started_at, now)}</Text>
              </View>
            </View>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: 12
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    gap: 12
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  activeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16803c'
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600'
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16
  },
  detailLabel: {
    marginBottom: 4,
    fontSize: 13,
    color: '#666666'
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '700'
  },
  emptyText: {
    fontSize: 15,
    color: '#555555'
  },
  errorText: {
    fontSize: 14,
    color: '#b42318'
  }
})
