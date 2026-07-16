import { StyleSheet, Text, View } from 'react-native'

import { useAuth } from '@/src/contexts/AuthContext'
import type { FamilyMember, MemberRole } from '@/src/types/family'

type FamilyMemberCardProps = {
  member: FamilyMember
}

const roleLabels: Record<MemberRole, string> = {
  admin: 'Administrador',
  family: 'Familiar',
  worker: 'Cuidador'
}

export function FamilyMemberCard({ member }: FamilyMemberCardProps) {
  const { session } = useAuth()
  const isCurrentUser = session?.user.id === member.user_id

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
            <View style={styles.youBadge}>
              <Text style={styles.youBadgeText}>Tú</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.role}>{roleLabels[member.role]}</Text>
      </View>
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
  }
})
