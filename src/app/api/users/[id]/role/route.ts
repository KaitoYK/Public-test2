import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    //Role Guard: Can restrict this only to ADMIN in a real application
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { id } = await params;
    const userId = Number(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    const newRole = body.role;

    if (!newRole || !["VIEWER", "EDITOR", "ADMIN"].includes(newRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, name: true, email: true, role: true }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
