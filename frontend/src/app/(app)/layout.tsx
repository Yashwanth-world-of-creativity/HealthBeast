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

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    await dbConnect();
    const user = await User.findById(decoded.userId);

    if (!user) {
      redirect("/login");
    }

    if (!user.onboarded) {
      redirect("/onboarding");
    }
  } catch {
    redirect("/login");
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}