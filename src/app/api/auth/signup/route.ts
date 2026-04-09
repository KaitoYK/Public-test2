import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    const hashedPassword = bcrypt.hashSync(password, 10);

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if(existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

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
