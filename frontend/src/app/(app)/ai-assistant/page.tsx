"use client";

import React, { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Send,
  Mic,
  Paperclip,
  Image as ImageIcon,
  Sparkles,
  Bot,
  User as UserIcon,
  X,
  Play,
  Pause,
  AlertCircle,
  Clock,
  History,
  FileText,
  Volume2,
  Menu,
  Copy,
  Share2,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useHealthStore } from "@/store/health-store";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  image?: string;
  audio?: {
    duration: string;
    isPlaying: boolean;
  };
}

interface Thread {
  id: string;
  title: string;
  date: string;
}

let idCounter = 0;
const generateId = (prefix: string) => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};

// Framer Motion animation variants
const messageVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
  exit: { opacity: 0, y: -10, scale: 0.95 },
};

const sidebarVariants: Variants = {
  hidden: { width: 0, opacity: 0 },
  visible: {
    width: 256,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { width: 0, opacity: 0 },
};

export default function AIAssistantPage() {
  const { symptoms, medications } = useHealthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I am your HealthBeast AI companion. Feel free to ask me anything about your symptoms, upload medical reports, drop prescription images, or send a voice message. How can I assist your recovery today?",
      timestamp: "2:00 PM",
    },
  ]);
  // ... rest of code ...
}
