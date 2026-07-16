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

  function buildCSV() {
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
    return [header, ...rows].join('\n')
  }

  async function writeCSV() {
    const dir = FileSystem.documentDirectory
    if (!dir) throw new Error('No hay acceso al sistema de archivos.')
    const uri = dir + 'turnos.csv'
    await FileSystem.writeAsStringAsync(uri, buildCSV(), {
      encoding: FileSystem.EncodingType.UTF8
    })
    return uri
  }

  async function handleDownload() {
    if (filteredShifts.length === 0) {
      Alert.alert('Sin datos', 'No hay turnos en el rango seleccionado.')
      return
    }
    setIsExporting(true)
    try {
      if (Platform.OS === 'android') {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()
        if (!permissions.granted) return
        const csv = buildCSV()
        const uri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          'turnos.csv',
          'text/csv'
        )
        await FileSystem.writeAsStringAsync(uri, csv, {
          encoding: FileSystem.EncodingType.UTF8
        })
      } else {
        await writeCSV()
      }
      Alert.alert(
        'Guardado',
        Platform.OS === 'ios'
          ? 'Archivo guardado. Encuéntralo en Archivos → care-hours.'
          : 'Archivo guardado correctamente.'
      )
    } catch {
      Alert.alert('Error', 'No se pudo guardar el archivo.')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleShare() {
    if (filteredShifts.length === 0) {
      Alert.alert('Sin datos', 'No hay turnos en el rango seleccionado.')
      return
    }
    setIsExporting(true)
    try {
      const uri = await writeCSV()
      await Sharing.shareAsync(uri, {
        mimeType: 'text/csv',
        dialogTitle: 'Compartir turnos'
      })
    } catch {
      Alert.alert('Error', 'No se pudo compartir el archivo.')
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

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionButtonOutline,
            isExporting && styles.actionButtonDisabled,
            pressed && styles.actionButtonOutlinePressed
          ]}
          disabled={isExporting}
          onPress={() => void handleShare()}
        >
          <Text style={styles.actionButtonOutlineText}>Compartir</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionButtonFill,
            isExporting && styles.actionButtonDisabled,
            pressed && styles.actionButtonFillPressed
          ]}
          disabled={isExporting}
          onPress={() => void handleDownload()}
        >
          <Text style={styles.actionButtonFillText}>
            {isExporting ? '…' : 'Guardar'}
          </Text>
        </Pressable>
      </View>
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
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{message}</Text>
        </View>
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
              <Pressable hitSlop={16} onPress={() => setActivePicker(null)}>
                <Text style={styles.pickerCancel}>Cancelar</Text>
              </Pressable>
              <Pressable hitSlop={16} onPress={confirmIOSPicker}>
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
    backgroundColor: '#FFFFFF'
  },
  centered: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    gap: 24
  },
  listContent: {
    paddingBottom: 40
  },
  filterBar: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  dateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  dateButton: {
    minHeight: 52,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FAFAFA'
  },
  dateButtonPressed: {
    backgroundColor: '#F3F4F6'
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111'
  },
  dateRangeDash: {
    fontSize: 16,
    color: '#9CA3AF'
  },
  actions: {
    flexDirection: 'row',
    gap: 10
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderRadius: 12
  },
  actionButtonDisabled: {
    opacity: 0.5
  },
  actionButtonOutline: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB'
  },
  actionButtonOutlinePressed: {
    backgroundColor: '#F9FAFB'
  },
  actionButtonOutlineText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111111'
  },
  actionButtonFill: {
    backgroundColor: '#111111'
  },
  actionButtonFillPressed: {
    backgroundColor: '#333333'
  },
  actionButtonFillText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  sectionHeader: {
    paddingTop: 28,
    paddingBottom: 8,
    paddingHorizontal: 24,
    fontSize: 15,
    fontWeight: '600',
    color: '#555555',
    textTransform: 'capitalize'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 16
  },
  rowLeft: {
    gap: 4
  },
  workerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111'
  },
  times: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  time: {
    fontSize: 17,
    color: '#444444'
  },
  timeSeparator: {
    fontSize: 15,
    color: '#9CA3AF'
  },
  duration: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111'
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 24
  },
  sectionSeparator: {
    height: 0
  },
  emptyText: {
    fontSize: 18,
    color: '#555555',
    textAlign: 'center',
    paddingTop: 56,
    paddingHorizontal: 24
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
    color: '#B91C1C',
    textAlign: 'center'
  },
  // iOS modal picker
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000040'
  },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32
  },
  pickerToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  pickerCancel: {
    fontSize: 17,
    color: '#888888'
  },
  pickerDone: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111'
  }
})
