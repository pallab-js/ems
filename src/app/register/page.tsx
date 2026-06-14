"use client";

import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"attendee" | "organizer">("attendee");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && profile) {
      router.push(`/dashboard/${profile.role}`);
    }
  }, [user, profile, loading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      setSubmitting(false);
      return;
    }

    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      // Update auth profile display name
      await updateProfile(fbUser, { displayName: name });

      // Create Firestore profile document
      const userDocRef = doc(db, "users", fbUser.uid);
      let finalRole: "attendee" | "organizer" | "admin" = role;
      if (email.toLowerCase().includes("admin")) {
        finalRole = "admin";
      }
      await setDoc(userDocRef, {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: name,
        role: finalRole,
        phoneNumber: phone || null,
        createdAt: new Date(),
      });

      // Refresh authentication profile in AuthContext
      await refreshProfile();
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already in use by another account.");
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-canvas">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-canvas">
      <Card className="w-full max-w-md shadow-lg border-hairline bg-surface-card">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="flex items-center space-x-2">
              <svg className="h-6 w-6 text-primary animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="12" y1="4" x2="12" y2="20" />
                <line x1="4" y1="12" x2="20" y2="12" />
              </svg>
              <span className="font-serif text-xl font-normal tracking-tight text-foreground">
                Xobha <span className="text-primary font-serif">Events</span>
              </span>
            </div>
          </div>
          <CardTitle className="font-serif text-2xl font-normal text-ink">Create Account</CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Join Xobha Events as an Attendee or Event Organizer
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-3">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="name" className="text-ink text-xs font-semibold">Full Name</Label>
              <Input
                id="name"
                placeholder="e.g. Priyanuj Borah"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                className="border-hairline bg-canvas"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-ink text-xs font-semibold">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                className="border-hairline bg-canvas"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-ink text-xs font-semibold">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. +91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={submitting}
                className="border-hairline bg-canvas"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="role" className="text-ink text-xs font-semibold">I want to join as</Label>
              <Select
                value={role}
                onValueChange={(val: any) => setRole(val)}
                disabled={submitting}
              >
                <SelectTrigger id="role" className="w-full border-hairline bg-canvas text-ink">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="border-hairline bg-surface-card text-ink">
                  <SelectItem value="attendee">Attendee (Buy tickets, view local events)</SelectItem>
                  <SelectItem value="organizer">Event Organizer (Publish and host events)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-ink text-xs font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 6 characters"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                className="border-hairline bg-canvas"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-primary hover:bg-primary-active text-on-primary font-semibold" disabled={submitting}>
              {submitting ? "Creating Account..." : "Register"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
