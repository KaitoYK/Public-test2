import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await getServerAuthSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const favorites = await prisma.favorites.findMany({
            where: { user_id: Number(session.user.id) },
            include: {
                prompt: true,
            },
        });

        return NextResponse.json(favorites);
    } catch (error) {
        console.error("Error fetching favorites:", error);
        return NextResponse.json(
            { error: "Failed to fetch favorites" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        
        const session = await getServerAuthSession();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { prompt_id } = await request.json();
        const favorite = await prisma.favorites.create({
            data: {
                user_id: Number(session.user.id),
                prompt_id: Number(prompt_id),
            },
        });

        return NextResponse.json(favorite);
    } catch (error) {
        console.error("Error adding favorite:", error);
        return NextResponse.json(
            { error: "Failed to add favorite" },
            { status: 500 }
        );
    }
}