import { Pressable, StyleSheet, Text, View } from 'react-native'

import { openLegalUrl } from '@/src/lib/legal'

type LegalCheckboxProps = {
  checked: boolean
  onToggle: () => void
  label: string
  linkText: string
  url: string
  accessibilityLabel: string
}

export function LegalCheckbox({
  checked,
  onToggle,
  label,
  linkText,
  url,
  accessibilityLabel
}: LegalCheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onToggle}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>

      <Text style={styles.text}>
        {label}{' '}
        <Text
          accessibilityRole="link"
          accessibilityLabel={`Abrir ${linkText} en el navegador`}
          style={styles.link}
          onPress={() => void openLegalUrl(url)}
        >
          {linkText}
        </Text>
        .
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10
  },
  rowPressed: {
    opacity: 0.7
  },
  box: {
    width: 26,
    height: 26,
    marginTop: 1,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  boxChecked: {
    borderColor: '#111111',
    backgroundColor: '#111111'
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  text: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: '#111111'
  },
  link: {
    fontWeight: '700',
    textDecorationLine: 'underline',
    color: '#111111'
  }
})
