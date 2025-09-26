import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin-server";
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

    // Check if user_role table exists
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_role'
      )
    `);

    const tableExists = tableCheck[0]?.exists;

    if (!tableExists) {
      return NextResponse.json({ 
        error: "Database tables not set up. Please run migrations first." 
      }, { status: 400 });
    }

    // Check if the current user is already an admin
    const isCurrentlyAdmin = await isAdmin(session.user.id);

    if (isCurrentlyAdmin) {
      return NextResponse.json({ 
        success: true, 
        message: "You are already an admin",
        isAdmin: true 
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Database tables are ready",
      isAdmin: false,
      canSetupAdmin: true 
    });

  } catch (error) {
    console.error("Error checking admin setup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}