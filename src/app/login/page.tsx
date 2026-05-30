"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, AlertCircle } from "lucide-react";
import Logo from "@/components/shared/Logo";
import BrandTitle from "@/components/shared/BrandTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Check onboarding redirect
      if (data.user?.onboarded) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to log in";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background glowing audio spheres & mesh gradient */}
      <div className="absolute top-[-20%] left-[-20%] size-[800px] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] size-[800px] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />

      {/* Floating Bezel Sphere in Background */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 right-1/4 size-72 rounded-full border border-sky-500/10 bg-sky-950/5 flex items-center justify-center opacity-30 pointer-events-none"
      >
        <div className="size-56 rounded-full border border-sky-400/10 flex items-center justify-center">
          <div className="size-40 rounded-full border border-primary/20 bg-sky-950/10 flex items-center justify-center shadow-[inset_0_0_20px_rgba(59,130,246,0.15)]" />
        </div>
      </motion.div>

      {/* Card Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-3xl border border-border/30 bg-card/30 backdrop-blur-xl shadow-2xl p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-3">
            <Logo size="lg" />
            <BrandTitle size="xl" />
          </Link>
          <p className="text-xs text-muted-foreground mt-2">
            Secure healthcare-grade authentication
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2"
          >
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yashwanth@healthbeast.ai"
                className="pl-10 h-11 bg-muted/40 border-border/40 placeholder:text-muted-foreground/60 rounded-xl text-xs focus-visible:ring-primary/45 focus-visible:ring-1"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 h-11 bg-muted/40 border-border/40 placeholder:text-muted-foreground/60 rounded-xl text-xs focus-visible:ring-primary/45 focus-visible:ring-1"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl shadow-lg shadow-primary/20 text-xs font-semibold flex items-center justify-center gap-1.5 mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {loading ? "Authenticating..." : "Sign In"} <ArrowRight className="size-4" />
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-border/20 pt-6 text-xs text-muted-foreground">
          {"Don't have an account? "}
          <Link href="/register" className="text-primary hover:underline font-bold">
            Create Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
