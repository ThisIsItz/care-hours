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
import { useCreateFamily } from '@/src/hooks/useCreateFamily'

const createFamilySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Escribe un nombre de al menos 2 caracteres.')
    .max(60, 'El nombre es demasiado largo.')
})

type CreateFamilyForm = z.infer<typeof createFamilySchema>

export default function CreateFamilyScreen() {
  const createFamilyMutation = useCreateFamily()

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateFamilyForm>({
    resolver: zodResolver(createFamilySchema),
    defaultValues: {
      name: ''
    }
  })

  async function onSubmit(values: CreateFamilyForm) {
    try {
      await createFamilyMutation.mutateAsync(values.name)
      router.replace('/home')
    } catch (error) {
      console.error('Create family error:', error)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>Crear grupo de cuidado</Text>

          <Text style={styles.subtitle}>
            Usa un nombre que todos puedan reconocer.
          </Text>
        </View>

        <Controller
          control={control}
          name="name"
          render={({ field: { value, onBlur, onChange } }) => (
            <FormInput
              label="Nombre del grupo"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              autoCapitalize="words"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => {
                void handleSubmit(onSubmit)()
              }}
            />
          )}
        />

        {errors.name ? (
          <Text style={styles.errorText}>{errors.name.message}</Text>
        ) : null}

        {createFamilyMutation.error ? (
          <Text style={styles.errorText}>
            {createFamilyMutation.error instanceof Error
              ? createFamilyMutation.error.message
              : 'No se pudo crear el grupo.'}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={createFamilyMutation.isPending}
          style={[
            styles.primaryButton,
            createFamilyMutation.isPending && styles.disabledButton
          ]}
          onPress={() => {
            void handleSubmit(onSubmit)()
          }}
        >
          {createFamilyMutation.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Crear grupo</Text>
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={createFamilyMutation.isPending}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
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
    fontSize: 16,
    color: '#B91C1C'
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
  },
  cancelText: {
    paddingVertical: 12,
    textAlign: 'center',
    fontSize: 16,
    textDecorationLine: 'underline'
  }
})
