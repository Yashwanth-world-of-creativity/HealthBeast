// src/constants/navigation.ts
import {
  LayoutDashboard,
  Bot,
  Activity,
  FileText,
  Pill,
  HeartPulse,
  Droplets,
  BarChart3,
  Settings,
} from "lucide-react";

export const navigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "AI Assistant",
    href: "/ai-assistant",
    icon: Bot,
  },
  {
    title: "Symptoms",
    href: "/symptoms",
    icon: Activity,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "Medications",
    href: "/medications",
    icon: Pill,
  },
  {
    title: "Recovery",
    href: "/recovery",
    icon: HeartPulse,
  },
  {
    title: "Hydration",
    href: "/hydration",
    icon: Droplets,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];