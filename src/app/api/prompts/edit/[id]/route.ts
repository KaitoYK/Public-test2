import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request: Request, { params }: {params: Promise<{ id: string }> }) {

    try{
        const Params = await params;

        const { title, description } = await request.json();

        const updatedPrompt = await prisma.prompts.update({

            where: { id: Number(Params.id) },
            data: {
                title,
                description,
                // id: Number(id),
            },
        });
        return new Response(JSON.stringify(updatedPrompt), { status: 200 });
    }catch(error){
        console.error("Error updating data:", error);
        return new Response(JSON.stringify({ error: "Error updating data" }), { status: 500 });
    }

}
