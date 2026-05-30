import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_beast";

interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export async function GET() {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthenticated" },
        { status: 401 }
      );
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Find User
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json(
      { error: "Session invalid or expired" },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthenticated" },
        { status: 401 }
      );
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Parse update body
    const body = await req.json();
    const { name, dateOfBirth, age, height, weight, bloodGroup, activityLevel, allergies, existingConditions, onboarded } = body;

    // Update User
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      {
        $set: {
          ...(name !== undefined && { name }),
          ...(dateOfBirth !== undefined && { dateOfBirth }),
          ...(age !== undefined && { age: Number(age) }),
          ...(height !== undefined && { height: Number(height) }),
          ...(weight !== undefined && { weight: Number(weight) }),
          ...(bloodGroup !== undefined && { bloodGroup }),
          ...(activityLevel !== undefined && { activityLevel }),
          ...(allergies !== undefined && { allergies }),
          ...(existingConditions !== undefined && { existingConditions }),
          ...(onboarded !== undefined && { onboarded }),
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile POST Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
