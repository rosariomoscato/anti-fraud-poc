import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from an authenticated user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    const adminStatus = await isAdmin(session.user.id);
    
    return NextResponse.json({ 
      isAdmin: adminStatus,
      userId: session.user.id,
      email: session.user.email
    });

  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json(
      { isAdmin: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}