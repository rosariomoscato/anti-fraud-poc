import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    console.log("DEBUG: Checking admin setup...");
    
    // Check if user_role table exists
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_role'
      )
    `);

    console.log("DEBUG: Table check result:", tableCheck);

    const tableExists = tableCheck[0]?.exists;
    console.log("DEBUG: Table exists:", tableExists);

    if (!tableExists) {
      console.log("DEBUG: Tables not found");
      return NextResponse.json({ 
        error: "Database tables not set up. Please run migrations first." 
      }, { status: 400 });
    }

    // Check if there are any users in the database
    const userCount = await db.execute(sql`SELECT COUNT(*) as count FROM "user"`);

    console.log("DEBUG: User count:", userCount);

    // Check if there are any admin roles
    const adminCount = await db.execute(sql`SELECT COUNT(*) as count FROM "user_role" WHERE role = 'admin'`);

    console.log("DEBUG: Admin count:", adminCount);

    return NextResponse.json({ 
      success: true, 
      message: "Database check completed",
      tableExists,
      userCount: userCount[0]?.count || 0,
      adminCount: adminCount[0]?.count || 0
    });

  } catch (error) {
    console.error("DEBUG: Error checking admin setup:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}