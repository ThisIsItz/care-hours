import DateTimePicker from '@react-native-community/datetimepicker'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useFamilyMembers } from '@/src/hooks/useFamilyMembers'
import { useShiftHistory } from '@/src/hooks/useShiftHistory'
import type { Shift } from '@/src/types/shift'

type ShiftSection = {
  title: string
  data: Shift[]
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

function formatDuration(startedAt: string, endedAt: string) {
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime()
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes} min`
  return `${hours} h ${minutes.toString().padStart(2, '0')} min`
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

type ShiftRowProps = {
  shift: Shift
  workerName: string
}

function ShiftRow({ shift, workerName }: ShiftRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.workerName}>{workerName}</Text>
        <View style={styles.times}>
          <Text style={styles.time}>{formatTime(shift.started_at)}</Text>
          <Text style={styles.timeSeparator}>→</Text>
          <Text style={styles.time}>{formatTime(shift.ended_at!)}</Text>
        </View>
      </View>
      <Text style={styles.duration}>{formatDuration(shift.started_at, shift.ended_at!)}</Text>
    </View>
  )
}

function startOfCurrentMonth(): Date {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfToday(): Date {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

export default function ShiftHistoryScreen() {
  const { data: shifts, isLoading, error } = useShiftHistory()
  const { data: members } = useFamilyMembers()

  const [startDate, setStartDate] = useState<Date>(startOfCurrentMonth)
  const [endDate, setEndDate] = useState<Date>(endOfToday)
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null)
  const [tempDate, setTempDate] = useState(new Date())
  const [isExporting, setIsExporting] = useState(false)

  const filteredShifts = useMemo(
    () =>
      (shifts ?? []).filter((s) => {
        const t = new Date(s.started_at).getTime()
        return t >= startDate.getTime() && t <= endDate.getTime()
      }),
    [shifts, startDate, endDate]
  )

  const sections = useMemo((): ShiftSection[] => {
    const grouped = new Map<string, Shift[]>()
    for (const shift of filteredShifts) {
      const key = new Date(shift.started_at).toDateString()
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(shift)
    }
    return Array.from(grouped.entries()).map(([, data]) => ({
      title: new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(new Date(data[0].started_at)),
      data
    }))
  }, [filteredShifts])

  function openPicker(target: 'start' | 'end') {
    setTempDate(target === 'start' ? startDate : endDate)
    setActivePicker(target)
  }

  function confirmIOSPicker() {
    if (activePicker === 'start') {
      setStartDate(tempDate)
    } else if (activePicker === 'end') {
      const d = new Date(tempDate)
      d.setHours(23, 59, 59, 999)
      setEndDate(d)
    }
    setActivePicker(null)
  }

  async function handleExport() {
    if (filteredShifts.length === 0) {
      Alert.alert('Sin datos', 'No hay turnos en el rango seleccionado.')
      return
    }
    setIsExporting(true)
    try {
      const header = 'Cuidador,Fecha,Hora inicio,Hora fin,Duración'
      const rows = filteredShifts.map((shift) => {
        const member = members?.find((m) => m.user_id === shift.worker_id)
        const name = (member?.full_name ?? 'Trabajador').replace(/"/g, '""')
        const date = new Intl.DateTimeFormat('es-ES').format(new Date(shift.started_at))
        const start = formatTime(shift.started_at)
        const end = formatTime(shift.ended_at!)
        const duration = formatDuration(shift.started_at, shift.ended_at!)
        return `"${name}","${date}","${start}","${end}","${duration}"`
      })
      const csv = [header, ...rows].join('\n')

      const dir = FileSystem.documentDirectory
      if (!dir) throw new Error('No hay acceso al sistema de archivos.')
      const uri = dir + 'turnos.csv'
      await FileSystem.writeAsStringAsync(uri, csv, {
        encoding: FileSystem.EncodingType.UTF8
      })
      await Sharing.shareAsync(uri, {
        mimeType: 'text/csv',
        dialogTitle: 'Exportar turnos'
      })
    } catch {
      Alert.alert('Error', 'No se pudo exportar el archivo.')
    } finally {
      setIsExporting(false)
    }
  }

  const filterBar = (
    <View style={styles.filterBar}>
      <View style={styles.dateRange}>
        <Pressable
          style={({ pressed }) => [styles.dateButton, pressed && styles.dateButtonPressed]}
          onPress={() => openPicker('start')}
        >
          <Text style={styles.dateButtonText}>{formatDateLabel(startDate)}</Text>
        </Pressable>
        <Text style={styles.dateRangeDash}>—</Text>
        <Pressable
          style={({ pressed }) => [styles.dateButton, pressed && styles.dateButtonPressed]}
          onPress={() => openPicker('end')}
        >
          <Text style={styles.dateButtonText}>{formatDateLabel(endDate)}</Text>
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.exportButton,
          isExporting && styles.exportButtonDisabled,
          pressed && styles.exportButtonPressed
        ]}
        disabled={isExporting}
        onPress={() => void handleExport()}
      >
        <Text style={styles.exportButtonText}>{isExporting ? '…' : 'CSV'}</Text>
      </Pressable>
    </View>
  )

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered} edges={['bottom']}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    )
  }

  if (error) {
    const message = error instanceof Error ? error.message : 'No se pudo cargar el historial.'
    return (
      <SafeAreaView style={styles.centered} edges={['bottom']}>
        {filterBar}
        <Text style={styles.errorText}>{message}</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* iOS: date picker in a bottom sheet modal */}
      {Platform.OS === 'ios' && activePicker ? (
        <Modal transparent animationType="slide" onRequestClose={() => setActivePicker(null)}>
          <Pressable style={styles.modalOverlay} onPress={() => setActivePicker(null)} />
          <View style={styles.pickerSheet}>
            <View style={styles.pickerToolbar}>
              <Pressable hitSlop={12} onPress={() => setActivePicker(null)}>
                <Text style={styles.pickerCancel}>Cancelar</Text>
              </Pressable>
              <Pressable hitSlop={12} onPress={confirmIOSPicker}>
                <Text style={styles.pickerDone}>Listo</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={(_, date) => {
                if (date) setTempDate(date)
              }}
            />
          </View>
        </Modal>
      ) : null}

      {/* Android: DateTimePicker renders as a native dialog */}
      {Platform.OS !== 'ios' && activePicker ? (
        <DateTimePicker
          value={activePicker === 'start' ? startDate : endDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            if (event.type === 'set' && date) {
              if (activePicker === 'start') {
                setStartDate(date)
              } else {
                const d = new Date(date)
                d.setHours(23, 59, 59, 999)
                setEndDate(d)
              }
            }
            setActivePicker(null)
          }}
        />
      ) : null}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={filterBar}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay turnos en este período.</Text>
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => {
          const member = members?.find((m) => m.user_id === item.worker_id)
          return <ShiftRow shift={item} workerName={member?.full_name ?? 'Trabajador'} />
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  centered: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
    gap: 24
  },
  listContent: {
    paddingBottom: 32
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  dateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  dateButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa'
  },
  dateButtonPressed: {
    backgroundColor: '#f0f0f0'
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111111'
  },
  dateRangeDash: {
    fontSize: 14,
    color: '#aaaaaa'
  },
  exportButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#111111'
  },
  exportButtonPressed: {
    backgroundColor: '#333333'
  },
  exportButtonDisabled: {
    opacity: 0.5
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff'
  },
  sectionHeader: {
    paddingTop: 20,
    paddingBottom: 6,
    paddingHorizontal: 24,
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
    textTransform: 'capitalize'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 16
  },
  rowLeft: {
    gap: 2
  },
  workerName: {
    fontSize: 15,
    fontWeight: '600'
  },
  times: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  time: {
    fontSize: 15,
    color: '#444444'
  },
  timeSeparator: {
    fontSize: 13,
    color: '#aaaaaa'
  },
  duration: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333'
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 24
  },
  sectionSeparator: {
    height: 0
  },
  emptyText: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    paddingTop: 48,
    paddingHorizontal: 24
  },
  errorText: {
    fontSize: 14,
    color: '#b42318',
    textAlign: 'center'
  },
  // iOS modal picker
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000040'
  },
  pickerSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24
  },
  pickerToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  pickerCancel: {
    fontSize: 16,
    color: '#888888'
  },
  pickerDone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111'
  }
})
