import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Please fill in all fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create User
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "User registered successfully", userId: newUser._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
