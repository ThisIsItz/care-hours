import DateTimePicker from '@react-native-community/datetimepicker'
import { router } from 'expo-router'
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

import { useAdminCreateShift } from '@/src/hooks/useAdminCreateShift'
import { useFamilyMembers } from '@/src/hooks/useFamilyMembers'

type FieldTarget = 'date' | 'start' | 'end'
type ActivePicker = FieldTarget | null

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

function formatTimeLabel(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function mergeDateAndTime(dateSource: Date, timeSource: Date): Date {
  const merged = new Date(dateSource)
  merged.setHours(timeSource.getHours(), timeSource.getMinutes(), 0, 0)
  return merged
}

export default function AddShiftScreen() {
  const { data: members, isLoading: areMembersLoading } = useFamilyMembers()
  const workers = (members ?? []).filter((m) => m.role === 'worker')

  const [workerId, setWorkerId] = useState<string | null>(null)
  const [date, setDate] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState<Date>(new Date())
  const [endTime, setEndTime] = useState<Date>(new Date())
  const [reason, setReason] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  // iOS
  const [activePicker, setActivePicker] = useState<ActivePicker>(null)
  const [tempDate, setTempDate] = useState(new Date())
  // Android
  const [androidPicker, setAndroidPicker] = useState<FieldTarget | null>(null)

  const { mutate, isPending, error: mutationError } = useAdminCreateShift()

  function openPicker(target: FieldTarget) {
    const current =
      target === 'date' ? date : target === 'start' ? startTime : endTime
    if (Platform.OS === 'ios') {
      setTempDate(current)
      setActivePicker(target)
    } else {
      setAndroidPicker(target)
    }
  }

  function applyPickedValue(target: FieldTarget, value: Date) {
    if (target === 'date') {
      setDate(value)
    } else if (target === 'start') {
      setStartTime(value)
    } else {
      setEndTime(value)
    }
  }

  function confirmIOSPicker() {
    if (activePicker) {
      applyPickedValue(activePicker, tempDate)
    }
    setActivePicker(null)
  }

  function handleAndroidPickerChange(
    event: { type: string },
    value: Date | undefined
  ) {
    const target = androidPicker
    setAndroidPicker(null)
    if (!target || event.type !== 'set' || !value) {
      return
    }
    applyPickedValue(target, value)
  }

  function handleSubmit() {
    if (!workerId) {
      setValidationError('Selecciona un trabajador.')
      return
    }

    const startedAt = mergeDateAndTime(date, startTime)
    const endedAt = mergeDateAndTime(date, endTime)

    if (endedAt <= startedAt) {
      setValidationError('La hora de salida debe ser posterior a la de entrada.')
      return
    }

    setValidationError(null)

    mutate(
      {
        workerId,
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        reason: reason.trim() || null
      },
      {
        onSuccess: () => {
          router.back()
        }
      }
    )
  }

  const serverError =
    mutationError instanceof Error ? mutationError.message : null

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* iOS: spinner modal */}
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
              mode={activePicker === 'date' ? 'date' : 'time'}
              display="spinner"
              onChange={(_, value) => {
                if (value) setTempDate(value)
              }}
            />
          </View>
        </Modal>
      ) : null}

      {/* Android: native dialog */}
      {Platform.OS !== 'ios' && androidPicker ? (
        <DateTimePicker
          value={
            androidPicker === 'date'
              ? date
              : androidPicker === 'start'
                ? startTime
                : endTime
          }
          mode={androidPicker === 'date' ? 'date' : 'time'}
          display="default"
          is24Hour
          onChange={handleAndroidPickerChange}
        />
      ) : null}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Trabajador</Text>
          {areMembersLoading ? (
            <ActivityIndicator />
          ) : workers.length === 0 ? (
            <Text style={styles.emptyText}>
              No hay trabajadores en tu familia todavía.
            </Text>
          ) : (
            <View style={styles.workerList}>
              {workers.map((worker) => {
                const selected = worker.user_id === workerId
                return (
                  <Pressable
                    key={worker.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`Seleccionar a ${worker.full_name}`}
                    style={({ pressed }) => [
                      styles.workerOption,
                      selected && styles.workerOptionSelected,
                      pressed && styles.workerOptionPressed
                    ]}
                    onPress={() => setWorkerId(worker.user_id)}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        selected && styles.radioOuterSelected
                      ]}
                    >
                      {selected ? <View style={styles.radioInner} /> : null}
                    </View>
                    <Text
                      style={[
                        styles.workerOptionText,
                        selected && styles.workerOptionTextSelected
                      ]}
                    >
                      {worker.full_name}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Fecha</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Fecha: ${formatDateLabel(date)}. Toca para cambiar`}
            style={({ pressed }) => [
              styles.dateButton,
              pressed && styles.dateButtonPressed
            ]}
            onPress={() => openPicker('date')}
          >
            <Text style={styles.dateButtonText}>{formatDateLabel(date)}</Text>
            <Text style={styles.dateButtonHint}>Toca para cambiar</Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldGroup, styles.rowField]}>
            <Text style={styles.fieldLabel}>Hora entrada</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Hora de entrada: ${formatTimeLabel(startTime)}. Toca para cambiar`}
              style={({ pressed }) => [
                styles.dateButton,
                pressed && styles.dateButtonPressed
              ]}
              onPress={() => openPicker('start')}
            >
              <Text style={styles.dateButtonText}>
                {formatTimeLabel(startTime)}
              </Text>
            </Pressable>
          </View>

          <View style={[styles.fieldGroup, styles.rowField]}>
            <Text style={styles.fieldLabel}>Hora salida</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Hora de salida: ${formatTimeLabel(endTime)}. Toca para cambiar`}
              style={({ pressed }) => [
                styles.dateButton,
                pressed && styles.dateButtonPressed
              ]}
              onPress={() => openPicker('end')}
            >
              <Text style={styles.dateButtonText}>
                {formatTimeLabel(endTime)}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Motivo (opcional)</Text>
          <TextInput
            style={styles.reasonInput}
            value={reason}
            onChangeText={setReason}
            placeholder="Por qué se añade este turno..."
            placeholderTextColor="#9CA3AF"
            maxLength={200}
            multiline
            accessibilityLabel="Motivo"
          />
          <Text style={styles.charCount}>{reason.length}/200</Text>
        </View>

        {validationError ? (
          <Text style={styles.errorText}>{validationError}</Text>
        ) : null}

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
          onPress={handleSubmit}
        >
          {isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Añadir turno</Text>
          )}
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
  fieldGroup: {
    gap: 8
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555555'
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280'
  },
  workerList: {
    gap: 8
  },
  workerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF'
  },
  workerOptionPressed: {
    backgroundColor: '#F9FAFB'
  },
  workerOptionSelected: {
    borderColor: '#111111',
    backgroundColor: '#F9FAFB'
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioOuterSelected: {
    borderColor: '#111111'
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#111111'
  },
  workerOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111'
  },
  workerOptionTextSelected: {
    color: '#111111'
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  rowField: {
    flex: 1
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
