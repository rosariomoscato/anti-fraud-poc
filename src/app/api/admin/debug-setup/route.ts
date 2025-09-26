import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assignUserRole } from "@/lib/admin-server";
import { sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    console.log("DEBUG: Setting up admin...");
    
    const body = await request.json();
    const { email } = body;

    console.log("DEBUG: Email received:", email);

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get the user ID from the user table
    const userResult = await db.execute(sql`
      SELECT id FROM "user" WHERE email = ${email}
    `);

    console.log("DEBUG: User result:", userResult);

    const user = userResult[0];

    if (!user || !user.id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = String(user.id);
    console.log("DEBUG: User ID:", userId);

    // Assign admin role
    const result = await assignUserRole(userId, 'admin', userId);
    console.log("DEBUG: Assign role result:", result);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Admin role assigned to ${email}`,
      userId 
    });

  } catch (error) {
    console.error("DEBUG: Error setting up admin:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}