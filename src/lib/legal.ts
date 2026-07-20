import { Alert, Linking } from 'react-native'

export const PRIVACY_POLICY_URL =
  'https://itziarurbieta.notion.site/Pol-tica-de-Privacidad-FichApp-3a31096e5d54805499e8d8b42b7b189c?source=copy_link'

export const TERMS_AND_CONDITIONS_URL =
  'https://itziarurbieta.notion.site/T-rminos-y-Condiciones-FichApp-3a31096e5d5480d9842af7e30d6ef147?source=copy_link'

export async function openLegalUrl(url: string) {
  try {
    const canOpen = await Linking.canOpenURL(url)

    if (!canOpen) {
      Alert.alert(
        'No se pudo abrir el enlace',
        'Inténtalo de nuevo más tarde.'
      )
      return
    }

    await Linking.openURL(url)
  } catch {
    Alert.alert('No se pudo abrir el enlace', 'Inténtalo de nuevo más tarde.')
  }
}
