"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigation } from "@/constants/navigation";
import { useUIStore } from "@/store/ui-store";
import Logo from "@/components/shared/Logo";
import BrandTitle from "@/components/shared/BrandTitle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <motion.aside
      initial={{ width: sidebarCollapsed ? 72 : 256 }}
      animate={{ width: sidebarCollapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "hidden md:flex flex-col h-full bg-card/45 backdrop-blur-xl border-r border-border/40 relative z-30 select-none",
        "shadow-[1px_0_10px_rgba(0,0,0,0.03)] dark:shadow-[1px_0_10px_rgba(0,0,0,0.2)]"
      )}
    >
      {/* Sidebar Header / Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/40">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <Logo size="default" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <BrandTitle size="default" />
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-muted">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "text-primary bg-primary/8 dark:bg-primary/12 font-semibold shadow-inner"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-muted/20"
              )}
            >
              {/* Active Indicator Glow/Border */}
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.8)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <Icon
                className={cn(
                  "size-5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />

              <AnimatePresence mode="wait">
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );

          if (sidebarCollapsed) {
            return (
              <Tooltip key={item.href} delayDuration={50}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.href}>{linkContent}</div>;
        })}
      </nav>

      {/* Sidebar Footer / Toggle Trigger */}
      <div className="p-4 border-t border-border/40 flex items-center justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="size-9 rounded-xl hover:bg-muted dark:hover:bg-muted/20 text-muted-foreground hover:text-foreground"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="size-5" />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="size-5" />
            </div>
          )}
        </Button>
      </div>
    </motion.aside>
  );
}
