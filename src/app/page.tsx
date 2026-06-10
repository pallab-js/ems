"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Calendar, Compass, Shield, Sparkles, MapPin, Tag } from "lucide-react";
import { MOCK_EVENTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function Home() {
  // Take 3 sample events to showcase on landing page
  const featuredEvents = MOCK_EVENTS.slice(0, 3);

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-to-tr from-emerald-950/15 via-background to-amber-500/5 border-b border-border/40">
        <div className="container mx-auto px-4 text-center max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            Designed for Assam & Northeast India
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
            One-Stop Solution for{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 bg-clip-text text-transparent">
              Event Management
            </span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Welcome to <span className="font-bold text-foreground">Xobha Events</span>. Organize, host, and discover cultural bihus, startup tech summits, weddings, and local assemblies with enterprise-grade role control.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/events" className={cn(buttonVariants({ size: "lg" }), "bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto font-semibold")}>
              Explore Events
            </Link>
            <Link href="/register" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:w-auto font-semibold")}>
              Host an Event
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 container mx-auto px-4 max-w-5xl space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Enterprise-Grade Features</h2>
          <p className="text-muted-foreground text-xs md:text-sm">Everything you need to orchestrate regional gatherings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-border rounded-2xl bg-card space-y-3 shadow-sm">
            <div className="p-3 bg-emerald-500/10 rounded-xl w-fit">
              <Compass className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-bold text-lg">Local Discovery</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Find gatherings based on districts in Assam and neighboring states. Easy-to-use search and filters.
            </p>
          </div>

          <div className="p-6 border border-border rounded-2xl bg-card space-y-3 shadow-sm">
            <div className="p-3 bg-emerald-500/10 rounded-xl w-fit">
              <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-bold text-lg">Role-Based Portals</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Tailored workspaces for Attendees (to view ticket logs) and Organizers (to view analytic reports and guest check-ins).
            </p>
          </div>

          <div className="p-6 border border-border rounded-2xl bg-card space-y-3 shadow-sm">
            <div className="p-3 bg-emerald-500/10 rounded-xl w-fit">
              <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-bold text-lg">Simple Reservation</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Register seats in a single click. Receive instant reservation verification codes backed by Firestore transactions.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 bg-muted/20 border-t border-border/40">
        <div className="container mx-auto px-4 max-w-5xl space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Featured Happenings</h2>
              <p className="text-muted-foreground text-xs md:text-sm">Upcoming events in Assam and Northeast India</p>
            </div>
            <Link href="/events" className={cn(buttonVariants({ variant: "ghost" }), "text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/10")}>
              View All Happenings &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((event) => {
              const dateObj = new Date(event.date);
              const formattedDate = dateObj.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              return (
                <div key={event.id} className="flex flex-col border border-border bg-card rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="relative h-44 w-full bg-muted overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {event.price === 0 ? "FREE" : `₹${event.price}`}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                        <Tag className="h-3 w-3" />
                        {event.category}
                      </div>
                      <h4 className="font-bold text-base line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {event.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                        {formattedDate}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <Link href={`/events/detail?id=${event.id}`} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full mt-2 font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-600/30")}>
                        Reserve a Spot
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
