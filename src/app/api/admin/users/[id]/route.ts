import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assignUserRole } from "@/lib/admin-server";
import { auth } from "@/lib/auth";
import { sql } from "drizzle-orm";

export async function PUT(request: NextRequest) {
  try {
    // Verify the request is from an authenticated admin
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ 
        error: "User ID and role are required" 
      }, { status: 400 });
    }

    if (!['user', 'admin', 'investigator'].includes(role)) {
      return NextResponse.json({ 
        error: "Invalid role. Must be user, admin, or investigator" 
      }, { status: 400 });
    }

    // Get the admin ID from the session
    const adminId = session.user.id;

    // Assign the new role
    const result = await assignUserRole(userId, role, adminId);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Log the action
    const auditDetails = JSON.stringify({ newRole: role, updatedBy: adminId });
    await db.execute(sql`
      INSERT INTO admin_audit (id, admin_id, action, entity_type, entity_id, details, created_at)
      VALUES (${crypto.randomUUID()}, ${adminId}, 'update_role', 'user_role', ${userId}, 
        ${auditDetails}, ${new Date().toISOString()})
    `);

    return NextResponse.json({ 
      success: true, 
      message: `User role updated to ${role}`,
      userId,
      role 
    });

  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}