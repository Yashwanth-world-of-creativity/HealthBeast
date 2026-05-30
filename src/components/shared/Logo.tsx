"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "default";
}

export default function Logo({ className, size = "default" }: LogoProps) {
  const sizeClasses = {
    sm: "size-8",
    md: "size-10",
    default: "size-10",
    lg: "size-16",
  };

  return (
    <div
      className={cn(
        "relative select-none shrink-0 flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      {/* 1. Concentric Bezel Rings (Tech/Audio inspired by image 2) */}
      <div className="absolute inset-0 rounded-full border border-sky-500/15 bg-sky-950/5 dark:bg-sky-950/10 backdrop-blur-xs flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.1)]" />
      <div className="absolute inset-1.5 rounded-full border border-sky-400/25 flex items-center justify-center" />
      <div className="absolute inset-3 rounded-full border border-primary/35 bg-sky-950/15 flex items-center justify-center shadow-[inset_0_0_10px_rgba(59,130,246,0.25)]" />

      {/* 2. Floating & Beating Concentric Core Beaker (Containing the Heart) */}
      <motion.div
        animate={{
          y: [0, -3.5, 0],
          scale: [1, 1.12, 0.96, 1.15, 1],
        }}
        transition={{
          y: {
            repeat: Infinity,
            duration: 3.2,
            ease: "easeInOut",
          },
          scale: {
            repeat: Infinity,
            duration: 1.6,
            ease: "easeInOut",
          }
        }}
        className="absolute inset-4.5 rounded-full bg-gradient-to-tr from-primary via-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_4px_12px_rgba(99,102,241,0.35),_inset_0_2px_4px_rgba(255,255,255,0.2)] border border-white/10 z-10"
      >
        {/* Glowing Beating Heart inside the floating ball */}
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-[70%] text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.85)]"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </motion.div>

      {/* 3. Outer pulsating echo waves */}
      <div className="absolute inset-[-4px] rounded-full border border-sky-500/5 pointer-events-none scale-105 animate-pulse" />
    </div>
  );
}
