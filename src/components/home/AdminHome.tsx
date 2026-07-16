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
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{currentFamily.family.name}</Text>

            <Text style={styles.subtitle}>
              {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
            </Text>
          </View>

          <Pressable style={styles.inviteButton} onPress={onInvitePress}>
            <Text style={styles.inviteButtonText}>Invitar</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trabajando ahora</Text>
          <ActiveWorkersSection />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personas</Text>

          {areMembersLoading ? <ActivityIndicator /> : null}

          {membersError ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {!areMembersLoading && !membersError
            ? members.map((member) => (
                <FamilyMemberCard key={member.id} member={member} />
              ))
            : null}
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
  dashboardContent: {
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
  headerContent: {
    flex: 1,
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
  inviteButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#111111'
  },
  inviteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
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
  },
  errorText: {
    fontSize: 14,
    color: '#b42318'
  }
})
