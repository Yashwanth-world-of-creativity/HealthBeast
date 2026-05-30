"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering icon after mounting on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled className="size-9 rounded-xl border-border/40">
        <Sun className="h-5 w-5 text-muted-foreground/30" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="size-9 rounded-xl border-border/40 hover:bg-muted dark:hover:bg-muted/20"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-muted-foreground hover:text-foreground" />
      ) : (
        <Moon className="h-5 w-5 text-muted-foreground hover:text-foreground" />
      )}
    </Button>
  );
}