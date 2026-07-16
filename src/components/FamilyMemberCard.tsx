import { StyleSheet, Text, View } from 'react-native'

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
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {member.full_name.trim().charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{member.full_name}</Text>
        <Text style={styles.role}>{roleLabels[member.role]}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12
  },
  avatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#eeeeee'
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700'
  },
  content: {
    flex: 1,
    gap: 3
  },
  name: {
    fontSize: 17,
    fontWeight: '600'
  },
  role: {
    fontSize: 14,
    color: '#666666'
  }
})
