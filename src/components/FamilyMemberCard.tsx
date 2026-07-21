import { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAuth } from '@/src/contexts/AuthContext'
import type { FamilyMember, MemberRole } from '@/src/types/family'

type FamilyMemberCardProps = {
  member: FamilyMember
  isAdmin?: boolean
  onChangeRole?: (member: FamilyMember, newRole: 'admin' | 'family') => void
  onRemove?: (member: FamilyMember) => void
}

const roleLabels: Record<MemberRole, string> = {
  admin: 'Administrador',
  family: 'Familiar',
  worker: 'Trabajador'
}

export function FamilyMemberCard({
  member,
  isAdmin = false,
  onChangeRole,
  onRemove
}: FamilyMemberCardProps) {
  const { session } = useAuth()
  const insets = useSafeAreaInsets()
  const isCurrentUser = session?.user.id === member.user_id
  const canManage = isAdmin && !isCurrentUser

  const [isMenuVisible, setIsMenuVisible] = useState(false)

  function closeMenu() {
    setIsMenuVisible(false)
  }

  function runAction(action?: () => void) {
    setIsMenuVisible(false)
    action?.()
  }

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {member.full_name.trim().charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{member.full_name}</Text>
          {isCurrentUser ? (
            <View accessible={false} style={styles.youBadge}>
              <Text style={styles.youBadgeText}>Tú</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.role}>{roleLabels[member.role]}</Text>
      </View>

      {canManage ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Más opciones para ${member.full_name}`}
          hitSlop={8}
          style={({ pressed }) => [
            styles.menuButton,
            pressed && styles.menuButtonPressed
          ]}
          onPress={() => setIsMenuVisible(true)}
        >
          <Text style={styles.menuButtonText}>Opciones</Text>
        </Pressable>
      ) : null}

      {canManage ? (
        <Modal
          transparent
          visible={isMenuVisible}
          animationType="fade"
          onRequestClose={closeMenu}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar menú"
            style={styles.sheetOverlay}
            onPress={closeMenu}
          />

          <View
            style={[
              styles.sheetWrapper,
              { paddingBottom: insets.bottom + 12 }
            ]}
          >
            <View style={styles.sheetGroup}>
              <Text style={styles.sheetTitle}>{member.full_name}</Text>

              {member.role === 'family' ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Convertir en administrador a ${member.full_name}`}
                  style={({ pressed }) => [
                    styles.sheetOption,
                    pressed && styles.sheetOptionPressed
                  ]}
                  onPress={() =>
                    runAction(() => onChangeRole?.(member, 'admin'))
                  }
                >
                  <Text style={styles.sheetOptionText}>
                    Convertir en administrador
                  </Text>
                </Pressable>
              ) : null}

              {member.role === 'admin' ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Eliminar rol de administrador a ${member.full_name}`}
                  style={({ pressed }) => [
                    styles.sheetOption,
                    pressed && styles.sheetOptionPressed
                  ]}
                  onPress={() =>
                    runAction(() => onChangeRole?.(member, 'family'))
                  }
                >
                  <Text style={styles.sheetOptionText}>
                    Eliminar rol de administrador
                  </Text>
                </Pressable>
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Eliminar a ${member.full_name}`}
                style={({ pressed }) => [
                  styles.sheetOption,
                  pressed && styles.sheetOptionPressed
                ]}
                onPress={() => runAction(() => onRemove?.(member))}
              >
                <Text
                  style={[styles.sheetOptionText, styles.sheetOptionDestructive]}
                >
                  Eliminar
                </Text>
              </Pressable>
            </View>

            <View style={styles.sheetGroup}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancelar"
                style={({ pressed }) => [
                  styles.sheetCancelOption,
                  pressed && styles.sheetOptionPressed
                ]}
                onPress={closeMenu}
              >
                <Text style={styles.sheetCancelText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16
  },
  avatar: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: '#F3F4F6'
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111'
  },
  content: {
    flex: 1,
    gap: 4
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111'
  },
  youBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0'
  },
  youBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#15803D'
  },
  role: {
    fontSize: 16,
    color: '#555555'
  },
  menuButton: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuButtonPressed: {
    backgroundColor: '#F3F4F6'
  },
  menuButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111'
  },
  // Action sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: '#00000055'
  },
  sheetWrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 0,
    gap: 8
  },
  sheetGroup: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  sheetTitle: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  sheetOption: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB'
  },
  sheetOptionPressed: {
    backgroundColor: '#F3F4F6'
  },
  sheetOptionText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#111111'
  },
  sheetOptionDestructive: {
    color: '#DC2626',
    fontWeight: '600'
  },
  sheetCancelOption: {
    paddingVertical: 16,
    alignItems: 'center'
  },
  sheetCancelText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111'
  }
})
