import { router } from 'expo-router'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ActiveWorkersSection } from '@/src/components/ActiveWorkersSection'
import { FamilyMemberCard } from '@/src/components/FamilyMemberCard'
import type { CurrentFamily, FamilyMember } from '@/src/types/family'

type FamilyHomeProps = {
  currentFamily: CurrentFamily
  members: FamilyMember[]
  areMembersLoading: boolean
  membersError: unknown
}

export function FamilyHome({
  currentFamily,
  members,
  areMembersLoading,
  membersError
}: FamilyHomeProps) {
  const errorMessage =
    membersError instanceof Error
      ? membersError.message
      : 'No se pudieron cargar los miembros.'

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{currentFamily.family.name}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Turnos activos</Text>
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
          <ActiveWorkersSection />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personas</Text>

          {areMembersLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" />
            </View>
          ) : null}

          {membersError ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {!areMembersLoading && !membersError
            ? members.map((member) => (
                <FamilyMemberCard key={member.id} member={member} />
              ))
            : null}
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
    gap: 32
  },
  header: {
    gap: 6
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111111'
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
  centered: {
    paddingVertical: 24,
    alignItems: 'center'
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
    color: '#B91C1C'
  }
})
