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

type AdminHomeProps = {
  currentFamily: CurrentFamily
  members: FamilyMember[]
  areMembersLoading: boolean
  membersError: unknown
  onInvitePress: () => void
  onSignOut: () => void
}

export function AdminHome({
  currentFamily,
  members,
  areMembersLoading,
  membersError,
  onInvitePress,
  onSignOut
}: AdminHomeProps) {
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
          <View style={styles.headerContent}>
            <Text style={styles.title}>{currentFamily.family.name}</Text>
            <Text style={styles.subtitle}>
              {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Invitar persona"
            style={({ pressed }) => [
              styles.inviteButton,
              pressed && styles.inviteButtonPressed
            ]}
            onPress={onInvitePress}
          >
            <Text style={styles.inviteButtonText}>Invitar</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trabajando ahora</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Ver historial de turnos" hitSlop={16} onPress={() => router.push('/shift-history')}>
              <Text style={styles.historialLink}>Historial</Text>
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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.signOutButtonPressed
          ]}
          onPress={onSignOut}
        >
          <Text style={styles.signOutButtonText}>Cerrar sesión</Text>
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
  content: {
    flexGrow: 1,
    padding: 24,
    gap: 32
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16
  },
  headerContent: {
    flex: 1,
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
  inviteButton: {
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: '#111111'
  },
  inviteButtonPressed: {
    backgroundColor: '#333333'
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600'
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
  signOutButtonText: {
    fontSize: 19,
    fontWeight: '600',
    color: '#111111'
  }
})
