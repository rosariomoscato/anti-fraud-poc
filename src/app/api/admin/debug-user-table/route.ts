import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    console.log("DEBUG: Checking user table structure...");
    
    // Get the structure of the user table
    const columns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'user' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);

    console.log("DEBUG: User table columns:", columns);

    // Get a sample user to see what data looks like
    const sampleUser = await db.execute(sql`
      SELECT * FROM "user" LIMIT 1
    `);

    console.log("DEBUG: Sample user:", sampleUser);

    // Get count of users
    const userCount = await db.execute(sql`SELECT COUNT(*) as count FROM "user"`);

    return NextResponse.json({ 
      success: true, 
      columns,
      sampleUser,
      userCount: userCount[0]?.count || 0
    });

  } catch (error) {
    console.error("DEBUG: Error checking user table:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}