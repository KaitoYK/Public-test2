import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();


export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> } 
) {
    try { 
        const Params = await params;
        
        const deletedPrompt = await prisma.prompts.delete({
            where: { 
                id: Number(Params.id)
             },
        });

        return NextResponse.json(deletedPrompt, { status: 200 });
    } catch (error) {
        console.error("Delete Error:", error);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}