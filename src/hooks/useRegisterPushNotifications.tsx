import { useEffect } from 'react'

import { subscribeToPushTokenChanges } from '@/src/services/notifications.service'

export function useRegisterPushNotifications() {
  useEffect(() => {
    return subscribeToPushTokenChanges()
  }, [])
}
