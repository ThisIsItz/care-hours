import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useCurrentFamily } from '@/src/hooks/useCurrentFamily'
import { supabase } from '@/src/lib/supabase'

export default function HomeScreen() {
  const { data: currentFamily, isLoading, error } = useCurrentFamily()

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

          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Crear grupo</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton}>
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
      <View style={styles.content}>
        <Text style={styles.title}>{currentFamily.family.name}</Text>

        <Text style={styles.subtitle}>
          Rol: {currentFamily.membership.role}
        </Text>
      </View>
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
  }
})
