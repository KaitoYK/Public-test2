import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {

    try{
        const { title, description } = await request.json();
        const updatedPrompt = await prisma.prompts.update({
            where: { id: Number(params.id) },
            data: {
                title,
                description,
            },
        });
        return new Response(JSON.stringify(updatedPrompt), { status: 200 });
    }catch(error){
        console.error("Error updating data:", error);
        return new Response(JSON.stringify({ error: "Error updating data" }), { status: 500 });
    }

}
