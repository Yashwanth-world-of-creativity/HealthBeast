import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_beast";

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Please provide email and password" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate email structure (require email ending with .com)
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
    if (!emailRegex.test(normalizedEmail) && normalizedEmail !== "demo@healthbeast.ai") {
      return NextResponse.json(
        { error: "Please enter a valid email address ending with .com (e.g. name@example.com)" },
        { status: 400 }
      );
    }

    // Find User
    let user = await User.findOne({ email: normalizedEmail });
    if (!user && normalizedEmail === "demo@healthbeast.ai") {
      const hashedPassword = await bcrypt.hash("Password123!", 12);
      user = await User.create({
        name: "Demo User",
        email: "demo@healthbeast.ai",
        password: hashedPassword,
        onboarded: true,
        age: 28,
        height: 180,
        weight: 75,
        bloodGroup: "O+",
        activityLevel: "Active",
        allergies: "None",
        existingConditions: "None",
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const cookieStore = await cookies();
    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        onboarded: user.onboarded,
      },
    });
  } catch (error) {
    console.error("[Login API] Unhandled error during login:", error);
    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
