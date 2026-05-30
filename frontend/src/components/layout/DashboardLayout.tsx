"use client";

import React from "react";
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
        {/* Soft background glow effects inspired by Apple Health & Headspace */}
        <div className="absolute top-[-10%] right-[-10%] size-[500px] rounded-full bg-primary/3 dark:bg-primary/5 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] left-[-10%] size-[500px] rounded-full bg-violet-500/3 dark:bg-violet-500/5 blur-[120px] pointer-events-none z-0" />

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
