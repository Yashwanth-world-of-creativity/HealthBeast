"use client";

import React, { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

export default function AIAssistantPage() {
  const { symptoms, medications } = useHealthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I am your HealthBeast AI companion. Feel free to ask me anything about your symptoms, upload medical reports, drop prescription images, or send a voice message. How can I assist you in your health journey today?",
      timestamp: "2:00 PM",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Suggested prompt list
  const suggestedPrompts = [
    { text: "Analyze my sleep logs", icon: Clock },
    { text: "Symptom check: dry throat", icon: AlertCircle },
    { text: "Verify my drug conflicts", icon: FileText },
  ];

  // Chat history threads list
  const threads: Thread[] = [
    { id: "1", title: "Sleep Analysis - May 30", date: "Today" },
    { id: "2", title: "Thyroid Report check", date: "Yesterday" },
    { id: "3", title: "Medication scheduling help", date: "2 days ago" },
  ];
  const [activeThreadId, setActiveThreadId] = useState<string>("1");

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Voice recording simulation timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }

    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  // Automatically grow textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Image Selection Handler (Mock File Upload)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
        toast.success("Image attached successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachedImage = () => {
    setAttachedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Toggle Recording handler
  const handleToggleRecording = () => {
    if (!isRecording) {
      setRecordingSeconds(0);
      setIsRecording(true);
      toast.info("Voice recording started. Speak now...");
    } else {
      setIsRecording(false);
      sendVoiceMessage();
    }
  };

  const sendVoiceMessage = () => {
    const secondsTotal = recordingSeconds > 0 ? recordingSeconds : 5;
    const newMessage: Message = {
      id: generateId("msg"),
      sender: "user",
      text: "Voice message input recorded.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      audio: {
        duration: formatTime(secondsTotal),
        isPlaying: false,
      },
    };

    setMessages((prev) => [...prev, newMessage]);
    simulateAIResponse("Voice input analysis");
  };

  // Send textual/image prompt
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !attachedImage) return;

    const currentInput = input;
    const currentImage = attachedImage;

    const newMessage: Message = {
      id: generateId("msg"),
      sender: "user",
      text: currentInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      image: currentImage || undefined,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    removeAttachedImage();

    // Trigger AI loading and response
    simulateAIResponse(currentInput, currentImage || undefined);
  };

  // Context-aware simulated responses
  const simulateAIResponse = (userPrompt: string, imageSrc?: string) => {
    setLoading(true);
    
    // Custom delay to simulate AI parsing
    setTimeout(() => {
      let replyText = "";
      const lowerInput = userPrompt.toLowerCase();

      // Analyze active state database context
      const activeSymptomNames = symptoms.map(s => s.name);
      const activeMedNames = medications.map(m => m.name);

      if (imageSrc) {
        replyText = "I've successfully performed clinical OCR scanning on your uploaded biometric file. The labels suggest stable baselines, but I notice slightly elevated liver filtration indicators, which is expected when metabolizing active supplements. Let me compare this with your symptom history.";
      } else if (lowerInput.includes("sleep") || lowerInput.includes("fatigue")) {
        replyText = `Based on your logged ${activeSymptomNames.includes("Fatigue") ? "Fatigue symptoms" : "vitals"}, I suggest maintaining an early hydration buffer. Dehydration can reduce heart rate variability (HRV) by up to 12%, contributing directly to physical exhaustion. Try taking your ${activeMedNames.includes("Vitamin D3 Co-factors") ? "Vitamin D3 Co-factors" : "supplements"} Post-Breakfast for optimal cellular transport.`;
      } else if (lowerInput.includes("sore") || lowerInput.includes("muscle") || lowerInput.includes("workout")) {
        replyText = `For muscle soreness recovery, I recommend incorporating Zone 1 steady-state walking (30 mins) to assist lymphatic clearing. Focus on calcium/magnesium complex foods like almonds and spinach. Tapping into your active supplement checklist for Magnesium Glycinate will significantly reduce soreness triggers.`;
      } else if (lowerInput.includes("voice") || lowerInput.includes("voice message") || lowerInput.includes("voice input")) {
        replyText = "I have parsed your recorded voice note. The acoustics and speech velocity are optimal, representing high neurological readiness (HRV around 78 ms). You logged ready for active cognitive or physical workflow calibration today.";
      } else {
        replyText = `I have logged your request. Considering your ${symptoms.length} active logged symptoms (${symptoms.map(s => s.name).join(", ") || "General health"}), and your supplement checklist, maintain water intake above 2.5 Liters. This optimizes metabolic clearance and supports longevity indicators.`;
      }

      const aiMessage: Message = {
        id: generateId("msg"),
        sender: "ai",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setLoading(false);
      toast.success("AI companion updated vitals analysis!");
    }, 1500);
  };

  const togglePlayAudio = (msgId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId && msg.audio) {
          return {
            ...msg,
            audio: {
              ...msg.audio,
              isPlaying: !msg.audio.isPlaying,
            },
          };
        }
        return msg;
      })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full w-full flex select-none overflow-hidden flex-1 min-h-0 relative">
      {/* 1. COLLAPSIBLE CHAT HISTORY SIDEBAR */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-64 border-r border-border/40 bg-card/15 backdrop-blur-md flex flex-col p-4 space-y-4 shrink-0 overflow-hidden"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-border/20 text-muted-foreground shrink-0">
              <History className="size-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Chat Threads</span>
            </div>

            <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
              {threads.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveThreadId(t.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border text-xs flex flex-col gap-1 transition-all cursor-pointer",
                    activeThreadId === t.id
                      ? "bg-primary/10 border-primary/20 text-primary font-semibold shadow-inner"
                      : "bg-muted/10 border-border/20 hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{t.title}</span>
                  <span className="text-[9px] opacity-60">{t.date}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MAIN CHAT CONSOLE */}
      <div className="flex-1 flex flex-col h-full bg-card/5 relative min-w-0">
        {/* Glowing glass background spots */}
        <div className="absolute top-[-10%] right-[-10%] size-[400px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] left-[-10%] size-[400px] rounded-full bg-violet-600/5 dark:bg-violet-600/10 blur-[120px] pointer-events-none z-0" />

        {/* Chat Header */}
        <div className="h-14 border-b border-border/40 px-4 sm:px-6 flex items-center justify-between backdrop-blur-md bg-background/50 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-xl hover:bg-muted dark:hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Menu className="size-4.5" />
            </button>
            <div className="flex items-center gap-2">
              <Bot className="size-5 text-primary animate-pulse" />
              <div>
                <span className="text-xs font-bold block text-foreground leading-none">HealthBeast Vitals Assist</span>
                <span className="text-[9px] text-muted-foreground mt-0.5 block leading-none">Persisted diagnostic engine</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <Sparkles className="size-3" /> Ready
          </div>
        </div>

        {/* Messages Logger Body */}
        <div className="flex-1 overflow-y-auto px-4 py-6 relative z-10 scrollbar-thin scrollbar-thumb-muted">
          <div className="max-w-3xl mx-auto w-full space-y-6">
            {mounted && messages.length === 1 && (
              <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                  <Bot className="size-6 animate-pulse" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h2 className="text-base font-bold text-foreground">How can I assist your recovery today?</h2>
                  <p className="text-[10px] text-muted-foreground">
                    Ask me about your symptoms, upload lab reports, drop pill photos, or voice-record questions.
                  </p>
                </div>
              </div>
            )}

            {mounted && (
              <AnimatePresence initial={false}>
                {messages.map((message) => {
                  const isAI = message.sender === "ai";
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex items-start gap-4 max-w-3xl w-full",
                        isAI ? "mr-auto" : "ml-auto flex-row-reverse"
                      )}
                    >
                      {/* Avatar icon */}
                      <div
                        className={cn(
                          "size-8 rounded-xl flex items-center justify-center border shrink-0 shadow-xs",
                          isAI
                            ? "bg-primary/10 border-primary/20 text-primary"
                            : "bg-muted border-border/20 text-muted-foreground"
                        )}
                      >
                        {isAI ? <Bot className="size-4" /> : <UserIcon className="size-4" />}
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        {/* Message Bubble */}
                        <div
                          className={cn(
                            "p-4 rounded-2xl border text-xs leading-relaxed font-sans shadow-xs max-w-[85%] inline-block",
                            isAI
                              ? "bg-card/45 backdrop-blur-md border-border/30 text-foreground"
                              : "bg-primary text-primary-foreground border-transparent float-right"
                          )}
                        >
                          {/* Attached Image inside Bubble */}
                          {message.image && (
                            <div className="mb-2.5 rounded-lg overflow-hidden border border-border/20 max-w-[200px]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={message.image} alt="Biometric upload" className="w-full object-cover" />
                            </div>
                          )}

                          {/* Audio Wave Player inside Bubble */}
                          {message.audio && (
                            <div className="flex items-center gap-3 py-1.5 px-2 bg-black/25 rounded-xl border border-border/10 mb-1 min-w-[200px]">
                              <button
                                onClick={() => togglePlayAudio(message.id)}
                                className="size-7 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                              >
                                {message.audio.isPlaying ? (
                                  <Pause className="size-3 text-emerald-500 animate-pulse" />
                                ) : (
                                  <Play className="size-3 fill-primary ml-0.5" />
                                )}
                              </button>
                              <div className="flex-1 flex gap-0.5 items-center justify-center h-4 px-1">
                                {/* Glowing voice waves */}
                                {[...Array(12)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={cn(
                                      "w-[2px] bg-primary/50 rounded-full transition-all duration-300",
                                      message.audio?.isPlaying ? "animate-pulse bg-emerald-500" : ""
                                    )}
                                    style={{
                                      height: message.audio?.isPlaying
                                        ? `${30 + (i % 4) * 20}%`
                                        : "30%",
                                      animationDelay: `${i * 0.08}s`,
                                    }}
                                  />
                                ))}
                              </div>
                              <span className="text-[9px] font-bold text-muted-foreground/80 shrink-0 select-none">
                                {message.audio.duration}
                              </span>
                            </div>
                          )}

                          <p className="whitespace-pre-wrap">{message.text}</p>
                        </div>

                        <span className={cn("text-[9px] text-muted-foreground/60 block px-1 clear-both", !isAI && "text-right")}>
                          {message.timestamp}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}

                {loading && (
                  <div className="flex items-start gap-4 mr-auto max-w-3xl w-full">
                    <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 shadow-xs animate-bounce">
                      <Bot className="size-4 animate-pulse" />
                    </div>
                    <Card className="p-3.5 rounded-2xl border border-border/30 bg-card/45 backdrop-blur-md shadow-xs flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                      <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                      <span className="size-1.5 rounded-full bg-primary animate-bounce" />
                    </Card>
                  </div>
                )}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Dynamic Suggested Prompts */}
        {messages.length === 1 && (
          <div className="px-4 py-2 relative z-10 shrink-0">
            <div className="max-w-3xl mx-auto w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
              {suggestedPrompts.map((prompt, i) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(prompt.text);
                      toast.info(`Prompt selected: "${prompt.text}"`);
                    }}
                    className="p-3 rounded-xl border border-border/20 bg-card/30 hover:bg-card/60 transition-colors flex items-center gap-2.5 text-left text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Icon className="size-4 text-primary shrink-0" />
                    <span className="truncate">{prompt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ChatGPT Premium Input Console */}
        <div className="p-4 relative z-10 shrink-0 bg-gradient-to-t from-background via-background/90 to-transparent">
          <div className="max-w-3xl mx-auto w-full">
            <div className="bg-card/45 backdrop-blur-md border border-border/40 focus-within:border-primary/45 rounded-2xl p-3 flex flex-col gap-2.5 shadow-lg transition-all relative">
              
              {/* Image Thumbnail Preview floating inside box */}
              {attachedImage && (
                <div className="relative size-14 rounded-lg overflow-hidden border border-border/40 shrink-0 mt-1 ml-1 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={attachedImage} alt="Attached Preview" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={removeAttachedImage}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}

              {/* Textarea Input area */}
              <div className="flex-1 flex items-start min-h-10 pt-1">
                {isRecording ? (
                  <div className="flex-1 flex items-center gap-3 py-1 px-1">
                    <div className="size-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Recording: {formatTime(recordingSeconds)}
                    </span>
                    <div className="flex-1 flex gap-0.5 items-center justify-center h-4 px-2">
                      {/* Siri Bouncing Voice Waveforms */}
                      {[...Array(14)].map((_, i) => (
                        <div
                          key={i}
                          className="w-[2px] bg-red-500/80 rounded-full animate-bounce shrink-0"
                          style={{
                            height: `${30 + (i % 4) * 20}%`,
                            animationDelay: `${i * 0.05}s`,
                            animationDuration: "0.6s",
                          }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRecording(false);
                        toast.info("Recording canceled.");
                      }}
                      className="text-[10px] font-bold text-destructive hover:underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message HealthBeast AI..."
                    rows={1}
                    className="w-full bg-transparent outline-none border-none text-xs text-foreground placeholder:text-muted-foreground/60 resize-none font-sans max-h-32 scrollbar-thin overflow-y-auto py-0.5"
                  />
                )}
              </div>

              {/* Bottom Tools & Actions Bar inside box */}
              <div className="flex items-center justify-between border-t border-border/10 pt-2.5">
                {/* Left tools list */}
                <div className="flex items-center gap-1.5">
                  {/* File attach trigger */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="size-8 rounded-xl bg-muted/40 border border-border/20 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors shrink-0 cursor-pointer hover:bg-muted"
                  >
                    <Paperclip className="size-4" />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  {/* Image upload shortcut icon */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="size-8 rounded-xl bg-muted/40 border border-border/20 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors shrink-0 cursor-pointer hover:bg-muted"
                  >
                    <ImageIcon className="size-4" />
                  </button>

                  {/* Microphone voice recorder trigger */}
                  <button
                    type="button"
                    onClick={handleToggleRecording}
                    className={cn(
                      "size-8 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer border hover:bg-muted",
                      isRecording
                        ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                        : "bg-muted/40 border-border/20 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isRecording ? <Volume2 className="size-4" /> : <Mic className="size-4" />}
                  </button>
                </div>

                {/* Right send button trigger */}
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={(!input.trim() && !attachedImage) || loading}
                  className="size-8 rounded-xl shrink-0 flex items-center justify-center bg-primary text-primary-foreground hover:opacity-90 shadow-md cursor-pointer"
                >
                  <Send className="size-3.5 text-primary-foreground" />
                </Button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}