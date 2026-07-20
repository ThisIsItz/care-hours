import DateTimePicker from '@react-native-community/datetimepicker'
import * as FileSystem from 'expo-file-system/legacy'
import * as Print from 'expo-print'
import { router } from 'expo-router'
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

import { useAdminDeleteShift } from '@/src/hooks/useAdminDeleteShift'
import { useCurrentFamily } from '@/src/hooks/useCurrentFamily'
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

function getEditNoticeTitle(shift: Shift) {
  if (shift.admin_action === 'created') return 'Turno añadido'
  if (shift.admin_action === 'stopped') return 'Turno finalizado'
  return 'Turno modificado'
}

type ShiftRowProps = {
  shift: Shift
  workerName: string
  editorName: string
  isAdmin: boolean
  canDelete: boolean
  showEditNotice: boolean
  showEditDetails: boolean
  onEdit: () => void
  onDelete: () => void
}

function ShiftRow({
  shift,
  workerName,
  editorName,
  isAdmin,
  canDelete,
  showEditNotice,
  showEditDetails,
  onEdit,
  onDelete
}: ShiftRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <Text style={styles.workerName}>{workerName}</Text>
        <Text style={styles.duration}>
          {formatDuration(shift.started_at, shift.ended_at!)}
        </Text>
      </View>

      <View style={styles.times}>
        <Text style={styles.time}>{formatTime(shift.started_at)}</Text>
        <Text style={styles.timeSeparator}>→</Text>
        <Text style={styles.time}>{formatTime(shift.ended_at!)}</Text>
      </View>

      {showEditNotice ? (
        <View style={styles.editDetailsCard}>
          <Text style={styles.editDetailsTitle}>
            {getEditNoticeTitle(shift)}
          </Text>
          {showEditDetails ? (
            <>
              <Text style={styles.editDetailsText}>
                {shift.edit_reason || 'Sin motivo indicado'}
              </Text>
              <Text style={styles.editDetailsMeta}>
                Editado por: {editorName}
              </Text>
            </>
          ) : null}
        </View>
      ) : null}

      {isAdmin || canDelete ? (
        <View style={styles.rowActions}>
          {isAdmin ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Editar turno de ${workerName}`}
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.editButtonPressed
              ]}
              onPress={onEdit}
            >
              <Text style={styles.editButtonText}>Editar</Text>
            </Pressable>
          ) : null}
          {canDelete ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Eliminar turno de ${workerName}`}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.deleteButtonPressed
              ]}
              onPress={onDelete}
            >
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
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
  const { data: currentFamily } = useCurrentFamily()
  const canExport = currentFamily?.membership.role !== 'worker'
  const isAdmin = currentFamily?.membership.role === 'admin'
  const deleteShiftMutation = useAdminDeleteShift()

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

  function handleDeleteShift(shiftId: string, workerName: string) {
    Alert.alert(
      'Eliminar turno',
      `¿Seguro que quieres eliminar el turno de ${workerName}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteShiftMutation.mutate(
              { shiftId },
              {
                onError: () => {
                  Alert.alert('Error', 'No se pudo eliminar el turno.')
                }
              }
            )
          }
        }
      ]
    )
  }

  function buildCSV() {
    const header = 'Cuidador,Fecha,Hora inicio,Hora fin,Duración'
    const rows = filteredShifts.map((shift) => {
      const member = members?.find((m) => m.user_id === shift.worker_id)
      const name = (member?.full_name ?? 'Trabajador').replace(/"/g, '""')
      const date = new Intl.DateTimeFormat('es-ES').format(
        new Date(shift.started_at)
      )
      const start = formatTime(shift.started_at)
      const end = formatTime(shift.ended_at!)
      const duration = formatDuration(shift.started_at, shift.ended_at!)
      return `"${name}","${date}","${start}","${end}","${duration}"`
    })
    return [header, ...rows].join('\n')
  }

  function buildPDFHtml() {
    const periodLabel = `${formatDateLabel(startDate)} — ${formatDateLabel(endDate)}`
    const rowsHtml = filteredShifts
      .map((shift) => {
        const member = members?.find((m) => m.user_id === shift.worker_id)
        const name = member?.full_name ?? 'Trabajador'
        const date = new Intl.DateTimeFormat('es-ES').format(
          new Date(shift.started_at)
        )
        const start = formatTime(shift.started_at)
        const end = formatTime(shift.ended_at!)
        const duration = formatDuration(shift.started_at, shift.ended_at!)
        return `<tr><td>${name}</td><td>${date}</td><td>${start}</td><td>${end}</td><td>${duration}</td></tr>`
      })
      .join('')

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<style>
  body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  p.period { font-size: 14px; color: #555; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { background: #f3f4f6; text-align: left; padding: 10px 12px; border-bottom: 2px solid #e5e7eb; }
  td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
  tr:last-child td { border-bottom: none; }
</style>
</head>
<body>
  <h1>Historial de turnos</h1>
  <p class="period">${periodLabel}</p>
  <table>
    <thead>
      <tr>
        <th>Cuidador</th><th>Fecha</th><th>Hora inicio</th><th>Hora fin</th><th>Duración</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</body>
</html>`
  }

  async function shareAsCSV() {
    setIsExporting(true)
    try {
      const dir = FileSystem.documentDirectory
      if (!dir) throw new Error('No hay acceso al sistema de archivos.')
      const uri = dir + 'turnos.csv'
      await FileSystem.writeAsStringAsync(uri, buildCSV(), {
        encoding: FileSystem.EncodingType.UTF8
      })
      await Sharing.shareAsync(uri, {
        mimeType: 'text/csv',
        dialogTitle: 'Exportar turnos'
      })
    } catch {
      Alert.alert('Error', 'No se pudo compartir el archivo.')
    } finally {
      setIsExporting(false)
    }
  }

  async function shareAsPDF() {
    setIsExporting(true)
    try {
      const { uri } = await Print.printToFileAsync({ html: buildPDFHtml() })
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Exportar turnos'
      })
    } catch {
      Alert.alert('Error', 'No se pudo generar el PDF.')
    } finally {
      setIsExporting(false)
    }
  }

  function handleShare() {
    if (filteredShifts.length === 0) {
      Alert.alert('Sin datos', 'No hay turnos en el rango seleccionado.')
      return
    }
    Alert.alert(
      'Compartir como',
      '¿En qué formato quieres exportar los turnos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'CSV',
          onPress: () => {
            void shareAsCSV()
          }
        },
        {
          text: 'PDF',
          onPress: () => {
            void shareAsPDF()
          }
        }
      ]
    )
  }

  const filterBar = (
    <View style={styles.filterBar}>
      <View style={styles.filterHeader}>
        <Text style={styles.filterTitle}>Período</Text>

        {isAdmin ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Añadir turno"
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed
            ]}
            onPress={() => router.push('/add-shift')}
          >
            <Text style={styles.addButtonText}>+ Añadir turno</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.dateFields}>
        <View style={styles.dateField}>
          <Text style={styles.dateFieldLabel}>Desde</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Fecha de inicio: ${formatDateLabel(startDate)}. Toca para cambiar`}
            style={({ pressed }) => [
              styles.dateButton,
              pressed && styles.dateButtonPressed
            ]}
            onPress={() => openPicker('start')}
          >
            <Text style={styles.dateButtonText}>
              {formatDateLabel(startDate)}
            </Text>
            <Text style={styles.dateButtonHint}>Toca para cambiar</Text>
          </Pressable>
        </View>

        <View style={styles.dateField}>
          <Text style={styles.dateFieldLabel}>Hasta</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Fecha de fin: ${formatDateLabel(endDate)}. Toca para cambiar`}
            style={({ pressed }) => [
              styles.dateButton,
              pressed && styles.dateButtonPressed
            ]}
            onPress={() => openPicker('end')}
          >
            <Text style={styles.dateButtonText}>
              {formatDateLabel(endDate)}
            </Text>
            <Text style={styles.dateButtonHint}>Toca para cambiar</Text>
          </Pressable>
        </View>
      </View>

      {canExport ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exportar turnos"
          accessibilityState={{ disabled: isExporting }}
          style={({ pressed }) => [
            styles.shareButton,
            isExporting && styles.actionButtonDisabled,
            pressed && styles.shareButtonPressed
          ]}
          disabled={isExporting}
          onPress={() => handleShare()}
        >
          <Text style={styles.shareButtonText}>
            {isExporting ? '…' : 'Exportar turnos'}
          </Text>
        </Pressable>
      ) : null}
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
    const message =
      error instanceof Error ? error.message : 'No se pudo cargar el historial.'
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
        <Modal
          transparent
          animationType="slide"
          onRequestClose={() => setActivePicker(null)}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar selector de fecha"
            style={styles.modalOverlay}
            onPress={() => setActivePicker(null)}
          />
          <View style={styles.pickerSheet}>
            <View style={styles.pickerToolbar}>
              <Pressable
                accessibilityRole="button"
                hitSlop={16}
                onPress={() => setActivePicker(null)}
              >
                <Text style={styles.pickerCancel}>Cancelar</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                hitSlop={16}
                onPress={confirmIOSPicker}
              >
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
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeader}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const member = members?.find((m) => m.user_id === item.worker_id)
          const workerName = member?.full_name ?? 'Trabajador'
          const editorName =
            members?.find((m) => m.user_id === item.edited_by)?.full_name ??
            'Administrador'
          const isCompleted = Boolean(item.ended_at)
          const showEditNotice = Boolean(
            item.edited_at || item.edit_reason || item.edited_by
          )
          const showEditDetails =
            showEditNotice && currentFamily?.membership.role !== 'worker'
          return (
            <ShiftRow
              shift={item}
              workerName={workerName}
              editorName={editorName}
              isAdmin={isAdmin && isCompleted}
              canDelete={isAdmin}
              showEditNotice={showEditNotice}
              showEditDetails={showEditDetails}
              onEdit={() =>
                router.push({
                  pathname: '/edit-shift',
                  params: {
                    shiftId: item.id,
                    workerName,
                    startedAt: item.started_at,
                    endedAt: item.ended_at ?? ''
                  }
                })
              }
              onDelete={() => handleDeleteShift(item.id, workerName)}
            />
          )
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        SectionSeparatorComponent={() => (
          <View style={styles.sectionSeparator} />
        )}
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
    paddingTop: 20,
    paddingBottom: 20,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111'
  },
  dateFields: {
    flexDirection: 'row',
    gap: 12
  },
  dateField: {
    flex: 1,
    gap: 6
  },
  dateFieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555555',
    paddingLeft: 2
  },
  dateButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FAFAFA',
    gap: 2
  },
  dateButtonPressed: {
    backgroundColor: '#F3F4F6',
    borderColor: '#9CA3AF'
  },
  dateButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111'
  },
  dateButtonHint: {
    fontSize: 14,
    color: '#6B7280'
  },
  actionButtonDisabled: {
    opacity: 0.5
  },
  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB'
  },
  addButtonPressed: {
    backgroundColor: '#F3F4F6'
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111'
  },
  shareButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#111111'
  },
  shareButtonPressed: {
    backgroundColor: '#333333'
  },
  shareButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  sectionHeaderContainer: {
    marginTop: 24,
    marginHorizontal: 24,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F3F4F6'
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111111',
    textTransform: 'capitalize'
  },
  row: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16
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
    color: '#6B7280'
  },
  duration: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111'
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 4
  },
  editButton: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  editButtonPressed: {
    backgroundColor: '#F3F4F6'
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151'
  },
  deleteButton: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteButtonPressed: {
    backgroundColor: '#FEF2F2'
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B91C1C'
  },
  editDetailsCard: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA'
  },
  editDetailsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9A2C00'
  },
  editDetailsText: {
    fontSize: 13,
    color: '#7C2D12',
    marginTop: 4
  },
  editDetailsMeta: {
    fontSize: 13,
    color: '#9A2C00',
    marginTop: 4
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
    color: '#555555'
  },
  pickerDone: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111'
  }
})
