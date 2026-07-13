import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import type { CurrentFamily } from '@/src/types/family'

type FamilyHomeProps = {
  currentFamily: CurrentFamily
  onSignOut: () => void
}

export function FamilyHome({ currentFamily, onSignOut }: FamilyHomeProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{currentFamily.family.name}</Text>
        <Text style={styles.subtitle}>Tu rol actual es familiar.</Text>
        <Text style={styles.description}>
          Puedes ver el grupo y participar desde aquí.
        </Text>

        <Pressable style={styles.secondaryButton} onPress={onSignOut}>
          <Text style={styles.secondaryButtonText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
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
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: '#666666'
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
