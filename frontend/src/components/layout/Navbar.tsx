"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Search,
  Menu,
  User as UserIcon,
  LogOut,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Activity,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { navigation } from "@/constants/navigation";
import { useUIStore } from "@/store/ui-store";
import { useHealthStore } from "@/store/health-store";
import ThemeToggle from "@/components/layout/ThemeToggle";
import Logo from "@/components/shared/Logo";
import BrandTitle from "@/components/shared/BrandTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarBadge,
} from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Navbar() {
  const pathname = usePathname();

  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const user = useHealthStore((state) => state.user);
  const updateUserProfile = useHealthStore((state) => state.updateUserProfile);
  const clearStore = useHealthStore((state) => state.clearStore);

  // Profile Hub States
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [healthGoals, setHealthGoals] = useState([
    "Track daily Vitamin D intake",
    "Maintain hydration above 2.5L",
    "Keep weekly recovery scores above 75%",
  ]);
  const [newGoal, setNewGoal] = useState("");

  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const userInitials = React.useMemo(() => {
    if (!user?.name) return "HB";
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user?.name]);

  // Get active route title
  const activeRoute = navigation.find((item) => item.href === pathname);
  const pageTitle = activeRoute ? activeRoute.title : "Dashboard";

  // Mock Notifications
  const mockNotifications = [
    { id: 1, text: "Time for your 2:00 PM Hydration goal", time: "5m ago", read: false },
    { id: 2, text: "Report 'BloodWork_May' analyzed by AI", time: "1h ago", read: false },
    { id: 3, text: "Medication: Vitamin D3 taken successfully", time: "4h ago", read: true },
  ];

  // Sync actual biometrics from store/DB when user loads or Dialog opens
  React.useEffect(() => {
    if (user) {
      setAge(user.age !== null && user.age !== undefined ? String(user.age) : "");
      setHeight(user.height !== null && user.height !== undefined ? String(user.height) : "");
      setWeight(user.weight !== null && user.weight !== undefined ? String(user.weight) : "");
      setBloodType(user.bloodGroup || "");
      if (user.allergies) {
        setHealthGoals((prev) => {
          const baseGoals = prev.filter((g) => !g.startsWith("Allergies:"));
          return [...baseGoals, `Allergies: ${user.allergies}`];
        });
      }
    }
  }, [user, profileOpen]);

  // Persist vital modifications directly into MongoDB and store
  const handleSaveVitals = async (field: string, value: string) => {
    try {
      const parsedValue = field === "bloodGroup" ? value : value === "" ? null : Number(value);
      await updateUserProfile({
        [field]: parsedValue,
      });
    } catch (err) {
      console.error("Failed to save vital", err);
    }
  };

  // True Account Sign-Out
  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        // Clear local storage / Zustand state
        clearStore();
        // Forces cookies invalidation and pushes to Landing Page
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    setHealthGoals((prev) => [...prev, newGoal.trim()]);
    setNewGoal("");
  };

  const handleRemoveGoal = (indexToRemove: number) => {
    setHealthGoals((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  return (
    <header className="h-16 border-b border-border/40 bg-background/45 backdrop-blur-xl flex items-center justify-between px-6 relative shrink-0 z-20 w-full select-none">
      {/* Left Area: Title and Mobile Menu */}
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden size-9 rounded-xl hover:bg-muted dark:hover:bg-muted/20"
            >
              <Menu className="size-5 text-foreground" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-6 bg-card/90 backdrop-blur-xl">
            <SheetHeader className="pb-6 border-b border-border/40">
              <SheetTitle className="flex items-center gap-2">
                <Logo size="sm" />
                <BrandTitle size="default" />
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "text-primary bg-primary/8 dark:bg-primary/12 font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-muted/20"
                    )}
                  >
                    <Icon className="size-5 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Page Title */}
        <h2 className="hidden sm:block text-lg font-semibold text-foreground font-heading">
          {pageTitle}
        </h2>
      </div>

      {/* Right Area: Search, Theme, Notifications, Avatar */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search symptoms, reports..."
            className="w-full pl-9 pr-8 h-9 rounded-xl bg-muted/40 border-border/40 focus-visible:ring-1 focus-visible:ring-primary/45 placeholder:text-muted-foreground/60 text-xs"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex h-5 select-none items-center gap-0.5 rounded border border-border/30 bg-muted px-1.5 font-mono text-[9px] font-medium text-muted-foreground/80 shadow-xs">
            ⌘K
          </kbd>
        </div>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative size-9 rounded-xl border-border/40 hover:bg-muted dark:hover:bg-muted/20"
            >
              <Bell className="size-4.5 text-muted-foreground" />
              {/* Notification Badge Dot */}
              <span className="absolute top-1 right-1 size-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2 rounded-xl bg-popover/90 backdrop-blur-xl">
            <DropdownMenuLabel className="flex justify-between items-center py-2 px-3">
              <span className="font-heading text-sm font-semibold">Notifications</span>
              <Button variant="ghost" size="xs" className="text-xs text-primary hover:text-primary-foreground">
                Mark all read
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-72 overflow-y-auto">
              {mockNotifications.map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  className="flex flex-col items-start gap-1 py-3 px-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 dark:hover:bg-muted/20"
                >
                  <div className="flex items-start gap-2 w-full">
                    {!notif.read && (
                      <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    )}
                    <span className={cn("text-xs leading-relaxed", !notif.read ? "font-semibold text-foreground" : "text-muted-foreground")}>
                      {notif.text}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/75 pl-3.5">{notif.time}</span>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="outline-none focus:ring-2 focus:ring-primary/30 rounded-full transition-all">
              <Avatar className="cursor-pointer hover:opacity-90 transition-opacity">
                <AvatarImage src="" alt={userName} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {userInitials}
                </AvatarFallback>
                <AvatarBadge className="bg-emerald-500 ring-background" />
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl bg-popover/90 backdrop-blur-xl">
            <DropdownMenuLabel className="py-2 px-3 flex flex-col">
              <span className="font-semibold text-sm text-foreground">{userName}</span>
              <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setProfileOpen(true)} className="rounded-lg py-2 cursor-pointer">
                <UserIcon className="size-4 text-muted-foreground" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg py-2 cursor-pointer">
                <Link href="/settings" className="flex items-center gap-2 w-full">
                  <SettingsIcon className="size-4 text-muted-foreground" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="rounded-lg py-2 text-destructive focus:text-destructive cursor-pointer flex items-center gap-2 w-full">
              <LogOut className="size-4 shrink-0" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 1. Premium Profile Vitals Hub Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border border-border/40 p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 font-heading text-lg">
              <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Activity className="size-4.5 animate-pulse" />
              </div>
              Vitals & Health Hub
            </DialogTitle>
            <DialogDescription className="text-xs">
              Review your biometric metrics and active clinical goals.
            </DialogDescription>
          </DialogHeader>

          {/* User Banner Card */}
          <div className="p-4 rounded-xl bg-gradient-to-tr from-primary/10 via-primary/5 to-violet-500/10 border border-primary/20 flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-sm text-foreground">{userName}</h4>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-primary font-bold uppercase tracking-wider">
                <Award className="size-3.5" /> Elite Beast Rank
              </div>
            </div>
          </div>

          {/* biometrics parameters grid */}
          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="p-3 rounded-xl bg-muted/40 border border-border/20">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Age (Years)</span>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                onBlur={() => handleSaveVitals("age", age)}
                className="w-full bg-transparent border-none outline-none font-bold text-sm mt-1 focus:text-primary transition-colors"
              />
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border/20">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Height (cm)</span>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                onBlur={() => handleSaveVitals("height", height)}
                className="w-full bg-transparent border-none outline-none font-bold text-sm mt-1 focus:text-primary transition-colors"
              />
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border/20">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Weight (kg)</span>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                onBlur={() => handleSaveVitals("weight", weight)}
                className="w-full bg-transparent border-none outline-none font-bold text-sm mt-1 focus:text-primary transition-colors"
              />
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border/20">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Blood Group</span>
              <input
                type="text"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                onBlur={() => handleSaveVitals("bloodGroup", bloodType)}
                className="w-full bg-transparent border-none outline-none font-bold text-sm mt-1 focus:text-primary transition-colors uppercase"
              />
            </div>
          </div>

          {/* Active Goals Checklist */}
          <div className="space-y-3">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Active Health Goals</span>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              <AnimatePresence>
                {healthGoals.map((goal, index) => (
                  <motion.div
                    key={goal}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="p-3 rounded-xl bg-muted/20 border border-border/20 flex items-center justify-between group"
                  >
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                      {goal}
                    </span>
                    <button
                      onClick={() => handleRemoveGoal(index)}
                      className="text-muted-foreground hover:text-destructive hover:scale-105 transition-all p-1"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add Goal Form */}
            <form onSubmit={handleAddGoal} className="flex gap-2 pt-2">
              <Input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Add new longevity goal..."
                className="h-9 rounded-xl text-xs bg-muted/40 border-border/40 placeholder:text-muted-foreground/60 focus-visible:ring-primary/45"
              />
              <Button type="submit" size="sm" className="rounded-xl px-3.5 h-9 bg-primary text-primary-foreground">
                <Plus className="size-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
