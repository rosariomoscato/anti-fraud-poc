import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAllUsersWithRoles } from "@/lib/admin-server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from an authenticated admin
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all users with their roles
    const users = await getAllUsersWithRoles();

    return NextResponse.json({ 
      success: true, 
      users 
    });

  } catch (error) {
    console.error("Error getting users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}