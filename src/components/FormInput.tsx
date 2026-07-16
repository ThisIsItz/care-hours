import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View
} from 'react-native'

type FormInputProps = TextInputProps & {
  label: string
}

export function FormInput({ label, ...inputProps }: FormInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        placeholderTextColor="#9CA3AF"
        autoCapitalize={inputProps.autoCapitalize ?? 'none'}
        style={[styles.input, inputProps.style]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 10
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111111'
  },
  input: {
    minHeight: 62,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#111111',
    backgroundColor: '#FFFFFF'
  }
})
