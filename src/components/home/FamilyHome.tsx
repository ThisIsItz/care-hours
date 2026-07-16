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
          <Text style={styles.title}>{currentFamily.family.name}</Text>

          <Pressable style={styles.signOutButton} onPress={onSignOut}>
            <Text style={styles.signOutButtonText}>Salir</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trabajando ahora</Text>
          <ActiveWorkersSection />
        </View>
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
    gap: 28
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16
  },
  title: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700'
  },
  signOutButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#111111'
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  section: {
    gap: 12
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700'
  }
})
