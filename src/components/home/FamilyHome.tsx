import { router } from 'expo-router'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ActiveWorkersSection } from '@/src/components/ActiveWorkersSection'
import type { CurrentFamily } from '@/src/types/family'

type FamilyHomeProps = {
  currentFamily: CurrentFamily
  onSignOut: () => void
}

export function FamilyHome({ currentFamily, onSignOut }: FamilyHomeProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{currentFamily.family.name}</Text>
          </View>

          <Pressable
            hitSlop={16}
            style={({ pressed }) => [
              styles.signOutButton,
              pressed && styles.signOutButtonPressed
            ]}
            onPress={onSignOut}
          >
            <Text style={styles.signOutText}>Salir</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trabajando ahora</Text>
            <Pressable hitSlop={16} onPress={() => router.push('/shift-history')}>
              <Text style={styles.historialLink}>Historial</Text>
            </Pressable>
          </View>
          <ActiveWorkersSection />
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
    flex: 1,
    gap: 6
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111111'
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
