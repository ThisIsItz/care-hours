import { StyleSheet, Text, View } from 'react-native'

import {
  PRIVACY_POLICY_URL,
  TERMS_AND_CONDITIONS_URL,
  openLegalUrl
} from '@/src/lib/legal'

type LegalLinksRowProps = {
  align?: 'center' | 'left'
}

export function LegalLinksRow({ align = 'center' }: LegalLinksRowProps) {
  if (align === 'left') {
    return (
      <View style={styles.stack}>
        <Text
          accessibilityRole="link"
          accessibilityLabel="Abrir la Política de Privacidad en el navegador"
          style={styles.link}
          onPress={() => void openLegalUrl(PRIVACY_POLICY_URL)}
        >
          Política de Privacidad
        </Text>
        <Text
          accessibilityRole="link"
          accessibilityLabel="Abrir los Términos y Condiciones en el navegador"
          style={styles.link}
          onPress={() => void openLegalUrl(TERMS_AND_CONDITIONS_URL)}
        >
          Términos y Condiciones
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.row}>
      <Text
        accessibilityRole="link"
        accessibilityLabel="Abrir la Política de Privacidad en el navegador"
        style={styles.link}
        onPress={() => void openLegalUrl(PRIVACY_POLICY_URL)}
      >
        Política de Privacidad
      </Text>
      <Text style={styles.separator}>·</Text>
      <Text
        accessibilityRole="link"
        accessibilityLabel="Abrir los Términos y Condiciones en el navegador"
        style={styles.link}
        onPress={() => void openLegalUrl(TERMS_AND_CONDITIONS_URL)}
      >
        Términos y Condiciones
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  stack: {
    alignItems: 'flex-start',
    gap: 2
  },
  link: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    textDecorationLine: 'underline',
    paddingVertical: 8
  },
  separator: {
    fontSize: 15,
    color: '#9CA3AF'
  }
})
