import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { WorkerShiftCard } from '@/src/components/WorkerShiftCard'
import type { CurrentFamily } from '@/src/types/family'

type WorkerHomeProps = {
  currentFamily: CurrentFamily
  onSignOut: () => void
}

export function WorkerHome({ currentFamily, onSignOut }: WorkerHomeProps) {
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
          <Text style={styles.sectionTitle}>Mi turno</Text>
          <WorkerShiftCard />
        </View>

        <Pressable style={styles.secondaryButton} onPress={onSignOut}>
          <Text style={styles.secondaryButtonText}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  content: {
    flexGrow: 1,
    padding: 24,
    gap: 24
  },
  header: {
    gap: 4
  },
  title: {
    fontSize: 32,
    fontWeight: '700'
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    color: '#555555'
  },
  section: {
    gap: 12
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700'
  },
  secondaryButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#111111'
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600'
  }
})
