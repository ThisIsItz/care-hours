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
          <View style={styles.headerText}>
            <Text style={styles.title}>{currentFamily.family.name}</Text>
            <Text style={styles.subtitle}>Tu turno de cuidado</Text>
          </View>

          <Pressable
            hitSlop={16}
            style={({ pressed }) => [
              styles.signOutButton,
              pressed && styles.signOutButtonPressed
            ]}
            onPress={confirmSignOut}
          >
            <Text style={styles.signOutText}>Salir</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mi turno</Text>
            <Pressable
              hitSlop={16}
              onPress={() => router.push('/shift-history')}
            >
              <Text style={styles.historialLink}>Historial</Text>
            </Pressable>
          </View>
          <WorkerShiftCard />
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  headerText: {
    gap: 6,
    flex: 1
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
  signOutButton: {
    paddingTop: 6
  },
  signOutButtonPressed: {
    opacity: 0.4
  },
  signOutText: {
    fontSize: 16,
    color: '#888888'
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
  historialLink: {
    fontSize: 16,
    color: '#555555'
  }
})
