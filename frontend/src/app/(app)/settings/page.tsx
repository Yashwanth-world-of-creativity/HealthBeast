"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import {
  Settings,
  LogOut,
  Moon,
  Sun,
  Shield,
  Activity,
  Save,
  Loader2,
  Lock,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface UserProfile {
  name: string;
  email: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  bloodGroup: string;
  activityLevel: string;
  allergies: string;
  existingConditions: string;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    age: null,
    height: null,
    weight: null,
    bloodGroup: "",
    activityLevel: "Moderate",
    allergies: "",
    existingConditions: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // 1. Fetch profile details on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/profile");
        if (!response.ok) {
          throw new Error("Failed to retrieve profile details.");
        }
        const data = await response.json();
        if (data.user) {
          setProfile({
            name: data.user.name || "",
            email: data.user.email || "",
            age: data.user.age || null,
            height: data.user.height || null,
            weight: data.user.weight || null,
            bloodGroup: data.user.bloodGroup || "",
            activityLevel: data.user.activityLevel || "Moderate",
            allergies: data.user.allergies || "",
            existingConditions: data.user.existingConditions || "",
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // 2. Save/Update Profile handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update profile details.");
      }

      toast.success("Health Profile updated successfully in our database!");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // 3. Handle Sign Out (Cookie Clearance & Redirect)
  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Signout API call failed.");
      }

      toast.success("Successfully logged out. Redirecting...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Logout failed. Please clear cache cookies manually.");
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col justify-center items-center gap-3">
        <Loader2 className="size-8 text-primary animate-spin" />
        <span className="text-xs text-muted-foreground font-semibold">
          Fetching biometric account configs...
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 select-none">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold font-heading flex items-center gap-2">
          <Settings className="size-6 text-primary animate-spin-slow" />
          System Preferences & Account Settings
        </h1>
        <p className="text-[10px] text-muted-foreground">
          Calibrate secure healthcare profile details, customize system theme preferences, and manage authentication sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* COLUMN 1: PREFERENCES & SECURITY QUICK BAR */}
        <div className="space-y-6">
          {/* Theme card */}
          <Card className="border-border/40 bg-card/45 backdrop-blur-md p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sun className="size-4 text-primary" /> Visual Theme
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "py-2 px-3 rounded-xl border text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all",
                  mounted && theme === "light"
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-border/20 text-muted-foreground hover:bg-muted/35"
                )}
              >
                <Sun className="size-3.5" /> Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "py-2 px-3 rounded-xl border text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all",
                  mounted && theme === "dark"
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-border/20 text-muted-foreground hover:bg-muted/35"
                )}
              >
                <Moon className="size-3.5" /> Dark
              </button>
            </div>
          </Card>

          {/* Security details card */}
          <Card className="border-border/40 bg-card/45 backdrop-blur-md p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Shield className="size-4 text-primary" /> Secure Auth
            </h3>

            <div className="space-y-3.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="size-3.5 text-primary shrink-0" />
                <span className="truncate">Email: {profile.email}</span>
              </div>
              <Button
                variant="destructive"
                onClick={handleSignOut}
                disabled={loggingOut}
                className="w-full rounded-xl text-xs flex items-center justify-center gap-2 h-10 shadow-lg cursor-pointer"
              >
                {loggingOut ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <LogOut className="size-4" /> Sign Out of Account
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* COLUMN 2 & 3: ADVANCED HEALTHCARE BIOMETRICS FORM */}
        <div className="md:col-span-2">
          <Card className="border-border/40 bg-card/45 backdrop-blur-md p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-3 border-b border-border/20 mb-6">
              <Activity className="size-4 text-primary animate-pulse" /> Bio-Telemetry Vitals Profile
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name input */}
                <div className="space-y-1.5">
                  <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Enter your name"
                    required
                    className="h-10 rounded-xl text-xs bg-muted/30 border-border/40 focus-visible:ring-primary/45 placeholder:text-muted-foreground/60 text-foreground"
                  />
                </div>

                {/* Age input */}
                <div className="space-y-1.5">
                  <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                    Age
                  </label>
                  <Input
                    type="number"
                    value={profile.age === null ? "" : profile.age}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        age: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    placeholder="e.g. 26"
                    className="h-10 rounded-xl text-xs bg-muted/30 border-border/40 focus-visible:ring-primary/45 placeholder:text-muted-foreground/60 text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Height input */}
                <div className="space-y-1.5">
                  <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                    Height (cm)
                  </label>
                  <Input
                    type="number"
                    value={profile.height === null ? "" : profile.height}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        height: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    placeholder="e.g. 178"
                    className="h-10 rounded-xl text-xs bg-muted/30 border-border/40 focus-visible:ring-primary/45 placeholder:text-muted-foreground/60 text-foreground"
                  />
                </div>

                {/* Weight input */}
                <div className="space-y-1.5">
                  <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                    Weight (kg)
                  </label>
                  <Input
                    type="number"
                    value={profile.weight === null ? "" : profile.weight}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        weight: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    placeholder="e.g. 74"
                    className="h-10 rounded-xl text-xs bg-muted/30 border-border/40 focus-visible:ring-primary/45 placeholder:text-muted-foreground/60 text-foreground"
                  />
                </div>

                {/* Blood group selection */}
                <div className="space-y-1.5">
                  <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                    Blood Group
                  </label>
                  <select
                    value={profile.bloodGroup}
                    onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl text-xs bg-muted/40 border border-border/40 text-foreground outline-none focus:border-primary/45"
                  >
                    <option value="">Select blood type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">
                  Activity Level & Schedule
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["Sedentary", "Moderate", "Active", "Elite"].map((lvl) => {
                    const isActive = profile.activityLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setProfile({ ...profile, activityLevel: lvl })}
                        className={cn(
                          "py-2 rounded-xl border text-[10px] uppercase font-bold cursor-pointer transition-all",
                          isActive
                            ? "bg-primary/10 border-primary text-primary"
                            : "border-border/20 text-muted-foreground hover:bg-muted/35"
                        )}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Allergies details */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                  Allergies & Medical Distresses (Optional)
                </label>
                <Input
                  type="text"
                  value={profile.allergies}
                  onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                  placeholder="e.g. Peanuts, Penicillin"
                  className="h-10 rounded-xl text-xs bg-muted/30 border-border/40 focus-visible:ring-primary/45 placeholder:text-muted-foreground/60 text-foreground"
                />
              </div>

              {/* Existing Conditions details */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                  Existing Clinical Conditions (Optional)
                </label>
                <Input
                  type="text"
                  value={profile.existingConditions}
                  onChange={(e) => setProfile({ ...profile, existingConditions: e.target.value })}
                  placeholder="e.g. Hypertension, Mild Asthma"
                  className="h-10 rounded-xl text-xs bg-muted/30 border-border/40 focus-visible:ring-primary/45 placeholder:text-muted-foreground/60 text-foreground"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl flex items-center justify-center gap-2 h-10 px-6 shadow-lg cursor-pointer"
                >
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="size-4" /> Save Profile Details
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}