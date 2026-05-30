"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BrandTitleProps {
  className?: string;
  size?: "default" | "xl";
}

export default function BrandTitle({ className, size = "default" }: BrandTitleProps) {
  const [displayText, setDisplayText] = useState("HealthBeast");
  const fullText = "HealthBeast";
  const baseText = "Health";
  const suffix = "Beast";

  useEffect(() => {
    let active = true;
    const runAnimation = async () => {
      while (active) {
        // 1. Wait at full HealthBeast for 2 seconds
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (!active) break;

        // 2. Vanish "Beast" letter by letter from backward (right-to-left)
        for (let i = suffix.length - 1; i >= 0; i--) {
          await new Promise((resolve) => setTimeout(resolve, 150));
          if (!active) break;
          setDisplayText(baseText + suffix.slice(0, i));
        }

        // Keep it at "Health" for a bit
        setDisplayText(baseText);

        // 3. Wait at "Health" for 1.5 seconds
        await new Promise((resolve) => setTimeout(resolve, 1500));
        if (!active) break;

        // 4. Reveal "Beast" again letter by letter (left-to-right)
        for (let i = 1; i <= suffix.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 150));
          if (!active) break;
          setDisplayText(baseText + suffix.slice(0, i));
        }

        setDisplayText(fullText);
      }
    };

    runAnimation();

    return () => {
      active = false;
    };
  }, []);

  const sizeClasses = {
    default: "text-lg",
    xl: "text-xl sm:text-2xl",
  };

  const suffixChars = displayText.slice(6).split("");

  return (
    <span
      className={cn(
        "font-bold bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent font-heading whitespace-nowrap inline-flex items-center select-none",
        sizeClasses[size],
        className
      )}
    >
      Health
      <span className="text-primary relative inline-flex items-center">
        <AnimatePresence mode="popLayout">
          {suffixChars.map((char, index) => (
            <motion.span
              key={index + char}
              initial={{ opacity: 0, scale: 0.7, y: 3 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: -3 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </AnimatePresence>
        <span className="font-extrabold font-mono">.</span>
      </span>
    </span>
  );
}
