import { router } from 'expo-router'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { WorkerShiftCard } from '@/src/components/WorkerShiftCard'
import type { CurrentFamily } from '@/src/types/family'

type WorkerHomeProps = {
  currentFamily: CurrentFamily
  onSignOut: () => void
}

export function WorkerHome({ currentFamily, onSignOut }: WorkerHomeProps) {
  function confirmSignOut() {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: onSignOut }
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{currentFamily.family.name}</Text>
          <Text style={styles.subtitle}>Tu turno de cuidado</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mi turno</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ver historial de turnos"
              style={({ pressed }) => [
                styles.historialButton,
                pressed && styles.historialButtonPressed
              ]}
              onPress={() => router.push('/shift-history')}
            >
              <Text style={styles.historialButtonText}>Historial</Text>
            </Pressable>
          </View>
          <WorkerShiftCard />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.signOutButtonPressed
          ]}
          onPress={confirmSignOut}
        >
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  content: {
    flexGrow: 1,
    padding: 24,
    gap: 28
  },
  header: {
    gap: 6
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111111'
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    color: '#555555'
  },
  section: {
    gap: 14
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111'
  },
  historialButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB'
  },
  historialButtonPressed: {
    backgroundColor: '#F3F4F6'
  },
  historialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111'
  },
  footer: {
    padding: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  signOutButton: {
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D1D5DB'
  },
  signOutButtonPressed: {
    backgroundColor: '#F9FAFB'
  },
  signOutText: {
    fontSize: 19,
    fontWeight: '600',
    color: '#111111'
  }
})
