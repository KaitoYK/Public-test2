import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { Users} from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();


const SignUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),  
  });



export async function POST(request: Request) {
  try {
    
    const body = await request.json();
    const { email, password, name } = SignUpSchema.parse(body);
    const hashedPassword = bcrypt.hashSync(password, 10);

    // const isValidEmail = typeof email === "string" && email.includes("@");
    // const isValidPassword = typeof password === "string" && password.length >= 6;
    // const isValidName = typeof name === "string" && name.trim().length > 0;   
    // if (!isValidEmail || !isValidPassword || !isValidName) {
    //   return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    // }
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if(existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const isValidEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }
    
    if(password.length < 6 ) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }
    if(name.trim().length === 0) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }

    // if(password !== confirmPassword) {
    //   return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    // }

    const user = await prisma.users.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "User created", user });

  } catch (error) {
    return NextResponse.json({ error: "User could not be created" }, { status: 500 });
  }
}
