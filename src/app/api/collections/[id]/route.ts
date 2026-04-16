import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { UpdateCollectionSchema } from "@/lib/validations/collection";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

// export async function PUT(request: Request, { params }: RouteContext) {
//     try {
//         const session = await getServerAuthSession();
//         if (!session?.user) {
//             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//         }

//         const { id } = await params;
//         const collectionId = Number(id);

//         if (isNaN(collectionId)) {
//             return NextResponse.json({ error: "Invalid collection ID" }, { status: 400 });
//         }

//         const body = await request.json();
//         const validated = UpdateCollectionSchema.safeParse(body);

//         if (!validated.success) {
//             return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
//         }

//         const { name, description, visibility } = validated.data;

//         const updatedCollection = await prisma.collections.update({
//             where: { id: collectionId },
//             data: {
//                 name,
//                 description,
//                 visibility,
//             },
//         });

//         return NextResponse.json(updatedCollection);
//     } catch (error) {
//         console.error("Error updating collection:", error);
//         return NextResponse.json(
//             { error: "Failed to update collection" },
//             { status: 500 }
//         );
//     }
// }

export async function DELETE(request: Request, { params }: RouteContext) {
    try {
        const session = await getServerAuthSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const collectionId = Number(id);

        if (isNaN(collectionId)) {
            return NextResponse.json({ error: "Invalid collection ID" }, { status: 400 });
        }

        await prisma.collections.delete({
            where: { id: collectionId },
        });

        return NextResponse.json({ message: "Collection deleted successfully" });
    } catch (error) {
        console.error("Error deleting collection:", error);
        return NextResponse.json(
            { error: "Failed to delete collection" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request, { params }: RouteContext) {
    try {
        const session = await getServerAuthSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = session.user.role;
        if (userRole !== "ADMIN" && userRole !== "EDITOR") {
            return NextResponse.json({ error: "You don't have permission to update a collection, only ADMIN and EDITOR can update a collection" }, { status: 403 });
        }

        const { id } = await params;
        const collectionId = Number(id);

        if (isNaN(collectionId)) {
            return NextResponse.json({ error: "Invalid collection ID" }, { status: 400 });
        }

        const body = await request.json();
        const validated = UpdateCollectionSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        const { name, description, visibility } = validated.data;

        const updatedCollection = await prisma.collections.update({
            where: { id: collectionId },
            data: {
                name,
                description,
                visibility,
            },
        });

        return NextResponse.json(updatedCollection);
    } catch (error) {
        console.error("Error updating collection:", error);
        return NextResponse.json(
            { error: "Failed to update collection" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request, { params }: RouteContext) {
    try {
        const session = await getServerAuthSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const collectionId = Number(id);

        if (isNaN(collectionId)) {
            return NextResponse.json({ error: "Invalid collection ID" }, { status: 400 });
        }

        const collection = await prisma.collections.findUnique({
            where: { id: collectionId },
        });

        return NextResponse.json(collection);
    } catch (error) {
        console.error("Error fetching collection:", error);
        return NextResponse.json(
            { error: "Failed to fetch collection" },
            { status: 500 }
        );
    }
}

