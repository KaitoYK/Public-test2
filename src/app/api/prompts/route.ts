import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export async function GET(request: Request) {
    try {
       const prompts = await prisma.prompts.findMany();
       return new Response(JSON.stringify(prompts), { status: 200 });
    }catch(error){
        console.error("Error fetching data:", error);
        return new Response(JSON.stringify({ error: "Error fetching data" }), { status: 500 });
    }
}

export async function POST(request: Request) {

    try{

         const { title, description, ownerId } = await request.json();
         
         const newPrompt = await prisma.prompts.create({
            data: {
                title,
                description,
                owner_id: ownerId, 
                // slug: title.toLowerCase().replace(/\s+/g, '-'),
            },
         });
         return new Response(JSON.stringify(newPrompt), { status: 201 });

    }catch(error){
        console.error("Error fetching data:", error);
        return new Response(JSON.stringify({ error: "Error fetching data" }), { status: 500 });
    }
}

