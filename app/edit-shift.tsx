import DateTimePicker from '@react-native-community/datetimepicker'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAdminEditShift } from '@/src/hooks/useAdminEditShift'

type ActivePicker = 'start' | 'end' | null

// Android: two-step picker (date then time)
type AndroidPicker = {
  field: 'start' | 'end'
  phase: 'date' | 'time'
  partial: Date
} | null

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function mergeDateAndTime(dateSource: Date, timeSource: Date): Date {
  const merged = new Date(dateSource)
  merged.setHours(timeSource.getHours(), timeSource.getMinutes(), 0, 0)
  return merged
}

export default function EditShiftScreen() {
  const { shiftId, workerName, startedAt, endedAt } = useLocalSearchParams<{
    shiftId: string
    workerName: string
    startedAt: string
    endedAt: string
  }>()

  const originalStart = new Date(startedAt)
  const originalEnd = endedAt ? new Date(endedAt) : null

  const [step, setStep] = useState<'edit' | 'confirm'>('edit')
  const [newStart, setNewStart] = useState<Date>(originalStart)
  const [newEnd, setNewEnd] = useState<Date>(originalEnd ?? new Date())
  // iOS
  const [activePicker, setActivePicker] = useState<ActivePicker>(null)
  const [tempDate, setTempDate] = useState(new Date())
  // Android
  const [androidPicker, setAndroidPicker] = useState<AndroidPicker>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  const { mutate, isPending, error: mutationError } = useAdminEditShift()

  function openPicker(target: 'start' | 'end') {
    const current = target === 'start' ? newStart : newEnd
    if (Platform.OS === 'ios') {
      setTempDate(current)
      setActivePicker(target)
    } else {
      setAndroidPicker({ field: target, phase: 'date', partial: current })
    }
  }

  function confirmIOSPicker() {
    if (activePicker === 'start') {
      setNewStart(tempDate)
    } else if (activePicker === 'end') {
      setNewEnd(tempDate)
    }
    setActivePicker(null)
  }

  function handleAndroidPickerChange(
    event: { type: string },
    date: Date | undefined
  ) {
    if (!androidPicker) return
    if (event.type !== 'set' || !date) {
      // User dismissed
      setAndroidPicker(null)
      return
    }
    if (androidPicker.phase === 'date') {
      // Merge selected date with existing time, then show time picker
      const withDate = mergeDateAndTime(date, androidPicker.partial)
      setAndroidPicker({
        field: androidPicker.field,
        phase: 'time',
        partial: withDate
      })
    } else {
      // Merge selected time with the date we stored in partial
      const final = mergeDateAndTime(androidPicker.partial, date)
      if (androidPicker.field === 'start') {
        setNewStart(final)
      } else {
        setNewEnd(final)
      }
      setAndroidPicker(null)
    }
  }

  function handleNext() {
    if (newEnd <= newStart) {
      setValidationError('La hora de fin debe ser posterior a la de inicio.')
      return
    }
    setValidationError(null)
    setStep('confirm')
  }

  function handleSave() {
    mutate(
      {
        shiftId,
        startedAt: newStart.toISOString(),
        endedAt: newEnd.toISOString(),
        reason: reason.trim() || null
      },
      {
        onSuccess: () => {
          router.back()
        }
      }
    )
  }

  if (step === 'edit') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {/* iOS: spinner modal (supports datetime in one step) */}
        {Platform.OS === 'ios' && activePicker ? (
          <Modal
            transparent
            animationType="slide"
            onRequestClose={() => setActivePicker(null)}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar selector"
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
                mode="datetime"
                display="spinner"
                onChange={(_, date) => {
                  if (date) setTempDate(date)
                }}
              />
            </View>
          </Modal>
        ) : null}

        {/* Android: two-step — date dialog first, then time dialog */}
        {Platform.OS !== 'ios' && androidPicker ? (
          <DateTimePicker
            value={androidPicker.partial}
            mode={androidPicker.phase}
            display="default"
            is24Hour
            onChange={handleAndroidPickerChange}
          />
        ) : null}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.workerLabel}>{workerName}</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Inicio</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Hora de inicio: ${formatDateTime(newStart)}. Toca para cambiar`}
              style={({ pressed }) => [
                styles.dateButton,
                pressed && styles.dateButtonPressed
              ]}
              onPress={() => openPicker('start')}
            >
              <Text style={styles.dateButtonText}>
                {formatDateTime(newStart)}
              </Text>
              <Text style={styles.dateButtonHint}>Toca para cambiar</Text>
            </Pressable>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Fin</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Hora de fin: ${formatDateTime(newEnd)}. Toca para cambiar`}
              style={({ pressed }) => [
                styles.dateButton,
                pressed && styles.dateButtonPressed
              ]}
              onPress={() => openPicker('end')}
            >
              <Text style={styles.dateButtonText}>
                {formatDateTime(newEnd)}
              </Text>
              <Text style={styles.dateButtonHint}>Toca para cambiar</Text>
            </Pressable>
          </View>

          {validationError ? (
            <Text style={styles.errorText}>{validationError}</Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed
            ]}
            onPress={handleNext}
          >
            <Text style={styles.primaryButtonText}>Siguiente</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // step === 'confirm'
  const serverError =
    mutationError instanceof Error ? mutationError.message : null

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>
            Cambiar el turno puede afectar los informes.
          </Text>
        </View>

        <Text style={styles.workerLabel}>{workerName}</Text>

        <View style={styles.compareSection}>
          <View style={styles.compareColumn}>
            <Text style={styles.compareLabel}>Antes</Text>
            <Text style={styles.compareTime}>
              {formatDateTime(originalStart)}
            </Text>
            <Text style={styles.compareArrow}>→</Text>
            <Text style={styles.compareTime}>
              {originalEnd ? formatDateTime(originalEnd) : '—'}
            </Text>
          </View>
          <View style={styles.compareDivider} />
          <View style={styles.compareColumn}>
            <Text style={styles.compareLabel}>Después</Text>
            <Text style={[styles.compareTime, styles.compareTimeNew]}>
              {formatDateTime(newStart)}
            </Text>
            <Text style={styles.compareArrow}>→</Text>
            <Text style={[styles.compareTime, styles.compareTimeNew]}>
              {formatDateTime(newEnd)}
            </Text>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Motivo del cambio (opcional)</Text>
          <TextInput
            style={styles.reasonInput}
            value={reason}
            onChangeText={setReason}
            placeholder="Escribe el motivo..."
            placeholderTextColor="#9CA3AF"
            maxLength={200}
            multiline
            accessibilityLabel="Motivo del cambio"
          />
          <Text style={styles.charCount}>{reason.length}/200</Text>
        </View>

        {serverError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{serverError}</Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isPending }}
          style={({ pressed }) => [
            styles.primaryButton,
            isPending && styles.buttonDisabled,
            pressed && !isPending && styles.primaryButtonPressed
          ]}
          disabled={isPending}
          onPress={handleSave}
        >
          {isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Guardar cambios</Text>
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed
          ]}
          onPress={() => setStep('edit')}
        >
          <Text style={styles.secondaryButtonText}>Cancelar</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  scrollContent: {
    padding: 24,
    gap: 20
  },
  workerLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111'
  },
  fieldGroup: {
    gap: 8
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555555'
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
  errorText: {
    fontSize: 15,
    color: '#B91C1C'
  },
  errorCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  primaryButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#111111'
  },
  primaryButtonPressed: {
    backgroundColor: '#333333'
  },
  buttonDisabled: {
    opacity: 0.5
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  secondaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D1D5DB'
  },
  secondaryButtonPressed: {
    backgroundColor: '#F3F4F6'
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151'
  },
  warningCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A'
  },
  warningText: {
    fontSize: 15,
    color: '#92400E'
  },
  compareSection: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden'
  },
  compareColumn: {
    flex: 1,
    padding: 16,
    gap: 4
  },
  compareDivider: {
    width: 1,
    backgroundColor: '#E5E7EB'
  },
  compareLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4
  },
  compareTime: {
    fontSize: 15,
    color: '#374151'
  },
  compareTimeNew: {
    color: '#111111',
    fontWeight: '600'
  },
  compareArrow: {
    fontSize: 13,
    color: '#9CA3AF'
  },
  reasonInput: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111111',
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#FAFAFA'
  },
  charCount: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'right'
  },
  // iOS modal
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
