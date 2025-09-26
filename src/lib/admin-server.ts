import { db } from "./db"
import { userRole, adminSettings, adminAudit } from "./schema"
import { eq, sql } from "drizzle-orm"

export interface UserRole {
  id: string
  userId: string
  role: 'user' | 'admin' | 'investigator'
  createdAt: Date
  createdBy?: string
}

export interface AdminSettings {
  id: string
  settingKey: string
  settingValue: any
  description?: string
  updatedAt: Date
  updatedBy?: string
}

export interface AdminAudit {
  id: string
  adminId: string
  action: string
  entityType: string
  entityId?: string
  details?: any
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

export async function getUserRole(userId: string): Promise<'user' | 'admin' | 'investigator' | null> {
  try {
    const roleData = await db
      .select({ role: userRole.role })
      .from(userRole)
      .where(eq(userRole.userId, userId))
      .limit(1)

    const userRoleValue = roleData[0]?.role
    if (userRoleValue === 'user' || userRoleValue === 'admin' || userRoleValue === 'investigator') {
      return userRoleValue
    }
    return null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'admin'
}

export async function requireAdmin(userId: string): Promise<{ success: boolean; error?: string }> {
  const role = await getUserRole(userId)
  
  if (!role) {
    return { success: false, error: 'User role not found' }
  }
  
  if (role !== 'admin') {
    return { success: false, error: 'Admin access required' }
  }
  
  return { success: true }
}

export async function getAdminSettings(): Promise<Record<string, any>> {
  try {
    const settings = await db.select().from(adminSettings)
    return settings.reduce((acc, setting) => {
      acc[setting.settingKey] = setting.settingValue
      return acc
    }, {} as Record<string, any>)
  } catch (error) {
    console.error('Error getting admin settings:', error)
    return {}
  }
}

export async function updateAdminSetting(
  key: string,
  value: any,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(adminSettings)
      .set({
        settingValue: value,
        updatedAt: new Date(),
        updatedBy: adminId
      })
      .where(eq(adminSettings.settingKey, key))

    // Log the action
    await logAdminAction(adminId, 'update_setting', 'admin_settings', key, {
      settingKey: key,
      oldValue: null, // Would need to fetch previous value
      newValue: value
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating admin setting:', error)
    return { success: false, error: 'Failed to update setting' }
  }
}

export async function logAdminAction(
  adminId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await db.insert(adminAudit).values({
      id: crypto.randomUUID(),
      adminId,
      action,
      entityType,
      entityId,
      details,
      ipAddress,
      userAgent,
      createdAt: new Date()
    })
  } catch (error) {
    console.error('Error logging admin action:', error)
    // Don't throw error for audit logging failures
  }
}

export async function assignUserRole(
  userId: string,
  role: 'user' | 'admin' | 'investigator',
  assignedBy: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user already has a role
    const existingRole = await db
      .select()
      .from(userRole)
      .where(eq(userRole.userId, userId))
      .limit(1)

    if (existingRole.length > 0) {
      // Update existing role
      await db
        .update(userRole)
        .set({ role })
        .where(eq(userRole.userId, userId))
    } else {
      // Create new role
      await db.insert(userRole).values({
        id: crypto.randomUUID(),
        userId,
        role,
        createdAt: new Date(),
        createdBy: assignedBy
      })
    }

    // Log the action
    await logAdminAction(assignedBy, 'assign_role', 'user_role', userId, {
      userId,
      role,
      previousRole: existingRole[0]?.role || null
    })

    return { success: true }
  } catch (error) {
    console.error('Error assigning user role:', error)
    return { success: false, error: 'Failed to assign role' }
  }
}

export async function revokeUserRole(
  userId: string,
  revokedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const existingRole = await db
      .select()
      .from(userRole)
      .where(eq(userRole.userId, userId))
      .limit(1)

    if (existingRole.length === 0) {
      return { success: false, error: 'User does not have a role' }
    }

    await db
      .delete(userRole)
      .where(eq(userRole.userId, userId))

    // Log the action
    await logAdminAction(revokedBy, 'revoke_role', 'user_role', userId, {
      userId,
      previousRole: existingRole[0].role
    })

    return { success: true }
  } catch (error) {
    console.error('Error revoking user role:', error)
    return { success: false, error: 'Failed to revoke role' }
  }
}

export async function getAllUsersWithRoles(): Promise<Array<{
  id: string
  email: string
  name?: string
  role?: 'user' | 'admin' | 'investigator'
  createdAt: string
}>> {
  try {
    // This query joins the user table with user_role table
    // Note: Better Auth uses 'createdAt' not 'created_at'
    const result = await db.execute(sql`
      SELECT 
        u.id,
        u.email,
        u.name,
        ur.role,
        u."createdAt" as created_at
      FROM "user" u
      LEFT JOIN "user_role" ur ON u.id = ur.user_id
      ORDER BY u."createdAt" DESC
    `)

    return result as any
  } catch (error) {
    console.error('Error getting users with roles:', error)
    return []
  }
}

export async function getAdminAuditLogs(limit: number = 50): Promise<AdminAudit[]> {
  try {
    const logs = await db
      .select()
      .from(adminAudit)
      .orderBy(sql`${adminAudit.createdAt} desc`)
      .limit(limit)

    return logs as AdminAudit[]
  } catch (error) {
    console.error('Error getting admin audit logs:', error)
    return []
  }
}