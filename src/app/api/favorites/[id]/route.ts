import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";


type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: RouteContext) {
    try {
        const session = await getServerAuthSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const favoriteId = Number(id);

        if (isNaN(favoriteId)) {
            return NextResponse.json({ error: "Invalid favorite ID" }, { status: 400 });
        }

        await prisma.favorites.delete({
            where: { id: favoriteId },
        });

        return NextResponse.json({ message: "Favorite deleted successfully" });
    } catch (error) {
        console.error("Error deleting favorite:", error);
        return NextResponse.json(
            { error: "Failed to delete favorite" },
            { status: 500 }
        );
    }
}
