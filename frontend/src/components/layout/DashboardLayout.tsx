"use client";

import React from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Collapsible desktop sidebar */}
      <Sidebar />

      {/* Main viewport */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative">
        {/* Soft background glow effects inspired by Apple Health & Headspace with animation */}
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[-10%] right-[-10%] size-[500px] rounded-full bg-primary/3 dark:bg-primary/5 blur-[120px] pointer-events-none z-0"
        />
        <motion.div
          animate={{
            x: [0, -15, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-[-10%] left-[-10%] size-[500px] rounded-full bg-violet-500/3 dark:bg-violet-500/5 blur-[120px] pointer-events-none z-0"
        />

        {/* Top header */}
        <Navbar />

        {/* Dynamic page content scroll area */}
        <main className="flex-1 flex flex-col min-h-0 min-w-0 overflow-y-auto z-10 relative scrollbar-thin scrollbar-thumb-muted">
          <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col min-h-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}