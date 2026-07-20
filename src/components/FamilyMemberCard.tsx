import { Pressable, StyleSheet, Text, View } from 'react-native'

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
  worker: 'Cuidador'
}

export function FamilyMemberCard({
  member,
  isAdmin = false,
  onChangeRole,
  onRemove
}: FamilyMemberCardProps) {
  const { session } = useAuth()
  const isCurrentUser = session?.user.id === member.user_id
  const canManage = isAdmin && !isCurrentUser

  return (
    <View style={styles.card}>
      <View style={styles.mainRow}>
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
      </View>

      {canManage ? (
        <View style={styles.actions}>
          {member.role === 'family' ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Hacer administrador a ${member.full_name}`}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed
              ]}
              onPress={() => onChangeRole?.(member, 'admin')}
            >
              <Text style={styles.actionButtonText}>Hacer admin</Text>
            </Pressable>
          ) : null}

          {member.role === 'admin' ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Hacer familiar a ${member.full_name}`}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed
              ]}
              onPress={() => onChangeRole?.(member, 'family')}
            >
              <Text style={styles.actionButtonText}>Hacer familiar</Text>
            </Pressable>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Eliminar a ${member.full_name}`}
            style={({ pressed }) => [
              styles.removeButton,
              pressed && styles.removeButtonPressed
            ]}
            onPress={() => onRemove?.(member)}
          >
            <Text style={styles.removeButtonText}>Eliminar</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
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
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  actionButton: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionButtonPressed: {
    backgroundColor: '#F3F4F6'
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151'
  },
  removeButton: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  removeButtonPressed: {
    backgroundColor: '#FEF2F2'
  },
  removeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B91C1C'
  }
})
