import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import DashboardLayout from "@/components/layout/DashboardLayout";

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_beast";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    redirect("/login");
  }

  let authenticated = false;
  let userOnboarded = false;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    await dbConnect();
    const user = await User.findById(decoded.userId);

    if (user) {
      authenticated = true;
      userOnboarded = user.onboarded;
    }
  } catch (error) {
    console.error("AppLayout Authentication Verification Error:", error);
  }

  if (!authenticated) {
    redirect("/login?clear=1");
  }

  if (!userOnboarded) {
    redirect("/onboarding");
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}