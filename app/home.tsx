import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AdminHome } from '@/src/components/home/AdminHome'
import { FamilyHome } from '@/src/components/home/FamilyHome'
import { WorkerHome } from '@/src/components/home/WorkerHome'
import { useCurrentFamily } from '@/src/hooks/useCurrentFamily'
import { useFamilyMembers } from '@/src/hooks/useFamilyMembers'
import { supabase } from '@/src/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'

export default function HomeScreen() {
  const { data: currentFamily, isLoading, error } = useCurrentFamily()
  const {
    data: members = [],
    isLoading: areMembersLoading,
    error: membersError
  } = useFamilyMembers(Boolean(currentFamily))

  const queryClient = useQueryClient()

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      Alert.alert('No se pudo cerrar sesión', error.message)
      return
    }

    queryClient.clear()
    router.replace('/')
  }

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

          <Pressable
            accessibilityRole="button"
            style={styles.secondaryButton}
            onPress={() => void handleSignOut()}
          >
            <Text style={styles.secondaryButtonText}>Cerrar sesión</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  if (currentFamily.membership.role === 'admin') {
    return (
      <AdminHome
        currentFamily={currentFamily}
        members={members}
        areMembersLoading={areMembersLoading}
        membersError={membersError}
        onInvitePress={() => router.navigate('/invite-member')}
        onSignOut={() => void handleSignOut()}
      />
    )
  }

  if (currentFamily.membership.role === 'worker') {
    return (
      <WorkerHome
        currentFamily={currentFamily}
        onSignOut={() => void handleSignOut()}
      />
    )
  }

  return (
    <FamilyHome
      currentFamily={currentFamily}
      onSignOut={() => void handleSignOut()}
    />
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
  }
})
