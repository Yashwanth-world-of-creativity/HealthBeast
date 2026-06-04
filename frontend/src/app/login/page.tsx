"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, AlertCircle, Sparkles } from "lucide-react";
import Logo from "@/components/shared/Logo";
import BrandTitle from "@/components/shared/BrandTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  React.useEffect(() => {
    setLoading(false);
    setDemoLoading(false);
  }, []);

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "demo@healthbeast.ai", password: "Password123!" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      toast.success("Demo session initialized!");
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to log in";
      setError(message);
      toast.error(message);
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      toast.error("Please fill in all fields");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
    if (!emailRegex.test(normalizedEmail) && normalizedEmail !== "demo@healthbeast.ai") {
      const msg = "Please enter a valid email ending with .com (e.g. name@gmail.com)";
      setError(msg);
      toast.error(msg);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      toast.success("Successfully logged in!");

      // Check onboarding redirect
      if (data.user?.onboarded) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to log in";
      setError(message);
      toast.error(message);
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
                placeholder="your.email@example.com"
                className="pl-10 h-11 bg-muted/20 border-border/30 placeholder:text-muted-foreground/50 rounded-xl text-xs transition-all duration-300 focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
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
                className="pl-10 h-11 bg-muted/20 border-border/30 placeholder:text-muted-foreground/50 rounded-xl text-xs transition-all duration-300 focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || demoLoading}
            className="w-full h-11 rounded-xl shadow-lg text-xs font-bold flex items-center justify-center gap-1.5 mt-6 bg-gradient-to-r from-emerald-500 via-primary to-violet-600 hover:opacity-95 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] text-white border-0 cursor-pointer"
          >
            {loading ? "Authenticating..." : "Sign In"} <ArrowRight className="size-4" />
          </Button>
        </form>

        <div className="relative my-5 flex items-center justify-center">
          <span className="absolute inset-x-0 h-[1px] bg-border/20" />
          <span className="relative bg-black/60 px-3.5 text-[9px] text-muted-foreground/75 uppercase font-black tracking-widest backdrop-blur-md">
            Or
          </span>
        </div>

        <Button
          type="button"
          disabled={loading || demoLoading}
          onClick={handleDemoLogin}
          className="w-full h-11 rounded-xl border border-primary/20 hover:border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          {demoLoading ? (
            "Launching Demo Ecosystem..."
          ) : (
            <>
              <Sparkles className="size-4 animate-pulse text-emerald-400" />
              Use Demo Account (Instant Login)
            </>
          )}
        </Button>

        <div className="mt-8 text-center border-t border-border/20 pt-6 text-xs text-muted-foreground">
          {"Don't have an account? "}
          <Link href="/register" className="text-primary hover:underline font-bold transition-all">
            Create Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
