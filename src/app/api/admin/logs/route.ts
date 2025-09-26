import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from an authenticated admin
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Get total count of logs
    const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM admin_audit`);
    const totalLogs = Number(countResult[0]?.count) || 0;

    // Get logs with pagination
    const logsResult = await db.execute(sql`
      SELECT 
        al.id,
        al.admin_id,
        al.action,
        al.entity_type,
        al.entity_id,
        al.details,
        al.ip_address,
        al.user_agent,
        al.created_at,
        u.email as admin_email,
        u.name as admin_name
      FROM admin_audit al
      LEFT JOIN "user" u ON al.admin_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    // Get admin information for each log
    const logs = await Promise.all(
      logsResult.map(async (log) => {
        // If we don't have admin info from the join, fetch it separately
        if (!log.admin_email && log.admin_id) {
          const adminResult = await db.execute(sql`
            SELECT email, name FROM "user" WHERE id = ${log.admin_id}
          `);
          const admin = adminResult[0];
          return {
            ...log,
            admin_email: admin?.email || 'Unknown',
            admin_name: admin?.name || 'Unknown Admin'
          };
        }
        return log;
      })
    );

    return NextResponse.json({ 
      success: true, 
      logs,
      pagination: {
        page,
        limit,
        total: totalLogs,
        pages: Math.ceil(totalLogs / limit)
      }
    });

  } catch (error) {
    console.error("Error getting admin logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}