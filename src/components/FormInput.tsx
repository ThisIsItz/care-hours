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
        placeholderTextColor="#8a8a8a"
        autoCapitalize={inputProps.autoCapitalize ?? 'none'}
        style={[styles.input, inputProps.style]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 8
  },
  label: {
    fontSize: 16,
    fontWeight: '600'
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 17
  }
})
