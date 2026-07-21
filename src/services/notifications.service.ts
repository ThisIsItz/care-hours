import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

import { supabase } from '@/src/lib/supabase'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
})

function getProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
  )
}

async function upsertPushToken(token: string): Promise<void> {
  const { error } = await supabase.rpc('register_push_token', {
    p_token: token,
    p_platform: Platform.OS
  })

  if (error) {
    throw new Error(error.message)
  }
}

async function fetchAndStoreExpoPushToken(): Promise<void> {
  const projectId = getProjectId()

  if (!projectId) {
    console.warn(
      'registerForPushNotificationsAsync: no EAS projectId configured — ' +
        'push tokens will not work in a standalone build until app.json has ' +
        'extra.eas.projectId set (run `eas init`).'
    )
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  )

  await upsertPushToken(token)
}

// Called when notification access is actually needed: right after a fresh
// sign-in, or when a worker starts a shift. Safe to call repeatedly — the OS
// only ever shows the permission dialog once (getPermissionsAsync no-ops
// after the user has answered), and re-registering the token is what keeps
// it fresh across reinstalls/device changes.
export async function registerForPushNotificationsAsync(): Promise<void> {
  if (!Device.isDevice) {
    return
  }

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT
      })
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      return
    }

    await fetchAndStoreExpoPushToken()
  } catch (error) {
    console.error('registerForPushNotificationsAsync error:', error)
  }
}

// The underlying native device token (APNs/FCM) can rotate at runtime. When
// it does, re-derive the Expo push token and upsert it so the stored token
// never goes stale. Mounted once for the life of an authenticated session.
export function subscribeToPushTokenChanges(): () => void {
  const subscription = Notifications.addPushTokenListener(() => {
    void fetchAndStoreExpoPushToken().catch((error) => {
      console.error('subscribeToPushTokenChanges error:', error)
    })
  })

  return () => subscription.remove()
}
