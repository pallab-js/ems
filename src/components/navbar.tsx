"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar, User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, profile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!profile) return "/dashboard/attendee";
    return `/dashboard/${profile.role}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 bg-clip-text text-transparent">
            Xobha Events
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/events" className="text-sm font-medium hover:text-primary transition-colors">
            Browse Events
          </Link>
          {user ? (
            <>
              <Link href={getDashboardLink()} className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <div className="flex items-center space-x-4 border-l border-border pl-4">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {profile?.displayName || user.email} ({profile?.role})
                </span>
                <Button variant="outline" size="sm" onClick={logout} className="h-8 gap-1.5">
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3 pl-4 border-l border-border">
              <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                Login
              </Link>
              <Link href="/register" className={cn(buttonVariants({ size: "sm" }), "bg-emerald-600 hover:bg-emerald-700 text-white")}>
                Register
              </Link>
            </div>
          )}
          <ThemeToggle />
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-2 md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-4">
          <Link
            href="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium hover:text-primary"
          >
            Browse Events
          </Link>
          {user ? (
            <>
              <Link
                href={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium hover:text-primary"
              >
                Dashboard
              </Link>
              <div className="border-t border-border pt-4 space-y-3">
                <div className="text-xs text-muted-foreground">
                  Logged in as {profile?.displayName || user.email} ({profile?.role})
                </div>
                <Button variant="outline" size="sm" onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full justify-center gap-1.5">
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full justify-center")}>
                Login
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className={cn(buttonVariants({ size: "sm" }), "w-full bg-emerald-600 hover:bg-emerald-700 text-white justify-center")}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
