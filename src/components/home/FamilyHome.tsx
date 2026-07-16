import { router } from 'expo-router'
import {
  ActivityIndicator,
  Alert,
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
  onSignOut: () => void
}

export function FamilyHome({
  currentFamily,
  members,
  areMembersLoading,
  membersError,
  onSignOut
}: FamilyHomeProps) {
  function confirmSignOut() {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: onSignOut }
    ])
  }

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
