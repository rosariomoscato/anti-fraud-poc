import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assignUserRole } from "@/lib/admin-server";
import { auth } from "@/lib/auth";
import { sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from an authenticated user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminId = session.user.id as string;

    // For now, allow any authenticated user to set up the admin
    // In production, you might want to restrict this further

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get the user ID from the user table
    const userResult = await db.execute(sql`
      SELECT id FROM "user" WHERE email = ${email}
    `);

    const user = userResult[0];

    if (!user || !user.id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = String(user.id);

    // Assign admin role
    const result = await assignUserRole(userId, 'admin', adminId);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Admin role assigned to ${email}`,
      userId 
    });

  } catch (error) {
    console.error("Error setting up admin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}