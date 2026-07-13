import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { FamilyMemberCard } from '@/src/components/FamilyMemberCard'
import { useCurrentFamily } from '@/src/hooks/useCurrentFamily'
import { useFamilyMembers } from '@/src/hooks/useFamilyMembers'
import { supabase } from '@/src/lib/supabase'
import { router } from 'expo-router'

export default function HomeScreen() {
  const { data: currentFamily, isLoading, error } = useCurrentFamily()
  const {
    data: members = [],
    isLoading: areMembersLoading,
    error: membersError
  } = useFamilyMembers(Boolean(currentFamily))

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>No se pudieron cargar tus datos</Text>

          <Text style={styles.subtitle}>
            {error instanceof Error ? error.message : 'Ha ocurrido un error.'}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!currentFamily) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Configura tu grupo de cuidado</Text>

          <Text style={styles.subtitle}>
            Crea un grupo nuevo o únete mediante una invitación.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.navigate('/create-family')}
          >
            <Text style={styles.primaryButtonText}>Crear grupo</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.navigate('/join-family')}
          >
            <Text style={styles.secondaryButtonText}>Unirme a un grupo</Text>
          </Pressable>

          <Pressable onPress={() => void supabase.auth.signOut()}>
            <Text style={styles.signOutText}>Cerrar sesión</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{currentFamily.family.name}</Text>

            <Text style={styles.subtitle}>
              {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
            </Text>
          </View>

          {currentFamily.membership.role === 'admin' ? (
            <Pressable
              style={styles.inviteButton}
              onPress={() => router.navigate('/invite-member')}
            >
              <Text style={styles.inviteButtonText}>Invitar</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personas</Text>

          {areMembersLoading ? <ActivityIndicator /> : null}

          {membersError ? (
            <Text style={styles.errorText}>
              {membersError instanceof Error
                ? membersError.message
                : 'No se pudieron cargar los miembros.'}
            </Text>
          ) : null}

          {!areMembersLoading &&
            !membersError &&
            members.map((member) => (
              <FamilyMemberCard key={member.id} member={member} />
            ))}
        </View>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => void supabase.auth.signOut()}
        >
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16
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
  primaryButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#111111'
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
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
  signOutText: {
    paddingVertical: 12,
    textAlign: 'center',
    textDecorationLine: 'underline'
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

  errorText: {
    fontSize: 14,
    color: '#b42318'
  }
})
