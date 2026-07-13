import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { z } from 'zod'

import { FormInput } from '@/src/components/FormInput'
import { useJoinFamily } from '@/src/hooks/useJoinFamily'

const joinFamilySchema = z.object({
  code: z.string().trim().length(8, 'El código debe tener 8 caracteres.')
})

type JoinFamilyForm = z.infer<typeof joinFamilySchema>

export default function JoinFamilyScreen() {
  const joinFamilyMutation = useJoinFamily()

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<JoinFamilyForm>({
    resolver: zodResolver(joinFamilySchema),
    defaultValues: {
      code: ''
    }
  })

  async function onSubmit(values: JoinFamilyForm) {
    try {
      await joinFamilyMutation.mutateAsync(values.code.toUpperCase())

      router.replace('/home')
    } catch (error) {
      console.error('Join family error:', error)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>Unirme a un grupo</Text>

          <Text style={styles.subtitle}>
            Introduce el código que te ha enviado el administrador.
          </Text>
        </View>

        <Controller
          control={control}
          name="code"
          render={({ field: { value, onBlur, onChange } }) => (
            <FormInput
              label="Código"
              value={value}
              onBlur={onBlur}
              onChangeText={(text) => onChange(text.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={8}
              returnKeyType="done"
              onSubmitEditing={() => {
                void handleSubmit(onSubmit)()
              }}
            />
          )}
        />

        {errors.code ? (
          <Text style={styles.errorText}>{errors.code.message}</Text>
        ) : null}

        {joinFamilyMutation.error ? (
          <Text style={styles.errorText}>
            {joinFamilyMutation.error instanceof Error
              ? joinFamilyMutation.error.message
              : 'No se pudo utilizar el código.'}
          </Text>
        ) : null}

        <Pressable
          disabled={joinFamilyMutation.isPending}
          style={[
            styles.primaryButton,
            joinFamilyMutation.isPending && styles.disabledButton
          ]}
          onPress={() => void handleSubmit(onSubmit)()}
        >
          {joinFamilyMutation.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Unirme</Text>
          )}
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
    marginTop: 8,
    fontSize: 17,
    lineHeight: 24,
    color: '#555555'
  },
  errorText: {
    fontSize: 14,
    color: '#b42318'
  },
  primaryButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#111111'
  },
  disabledButton: {
    opacity: 0.5
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600'
  }
})
