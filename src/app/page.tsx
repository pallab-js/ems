"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Calendar, Compass, Shield, Sparkles, MapPin, Tag } from "lucide-react";
import { Event } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const q = query(
          collection(db, "events"),
          where("status", "==", "published"),
          limit(3)
        );
        const querySnapshot = await getDocs(q);
        const fetched: Event[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetched.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
            location: data.location,
            district: data.district,
            category: data.category,
            image: data.image || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800&auto=format&fit=crop",
            organizerId: data.organizerId,
            organizerName: data.organizerName || "Organizer",
            capacity: Number(data.capacity || 100),
            availableTickets: Number(data.availableTickets || data.capacity || 100),
            price: Number(data.price || 0),
            status: data.status,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          });
        });

        if (fetched.length > 0) {
          setFeaturedEvents(fetched);
        } else {
          setFeaturedEvents([]);
        }
      } catch (err) {
        console.warn("Error fetching featured events from Firestore:", err);
        setFeaturedEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-canvas">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-canvas border-b border-hairline">
        <div className="container mx-auto px-4 text-center max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Designed for Assam & Northeast India
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-normal tracking-[-1.5px] leading-[1.05] text-ink">
            One-Stop Solution for{" "}
            <span className="text-primary font-serif">
              Event Management
            </span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Welcome to <span className="font-semibold text-foreground">Xobha Events</span>. Organize, host, and discover cultural bihus, startup tech summits, weddings, and local assemblies with enterprise-grade role control.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/events" className={cn(buttonVariants({ size: "lg" }), "bg-primary hover:bg-primary-active text-on-primary w-full sm:w-auto font-semibold")}>
              Explore Events
            </Link>
            <Link href="/register" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:w-auto font-semibold border-hairline hover:bg-surface-card")}>
              Host an Event
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 container mx-auto px-4 max-w-5xl space-y-12">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl md:text-4xl font-normal tracking-[-1px] text-ink">Enterprise-Grade Features</h2>
          <p className="text-muted-foreground text-sm">Everything you need to orchestrate regional gatherings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-hairline rounded-xl bg-surface-card space-y-4 shadow-sm">
            <div className="p-3 bg-primary/10 rounded-lg w-fit">
              <Compass className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-normal text-ink">Local Discovery</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Find gatherings based on districts in Assam and neighboring states. Easy-to-use search and filters.
            </p>
          </div>

          <div className="p-6 border border-hairline rounded-xl bg-surface-card space-y-4 shadow-sm">
            <div className="p-3 bg-primary/10 rounded-lg w-fit">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-normal text-ink">Role-Based Portals</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Tailored workspaces for Attendees (to view ticket logs) and Organizers (to view analytic reports and guest check-ins).
            </p>
          </div>

          <div className="p-6 border border-hairline rounded-xl bg-surface-card space-y-4 shadow-sm">
            <div className="p-3 bg-primary/10 rounded-lg w-fit">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-normal text-ink">Simple Reservation</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Register seats in a single click. Receive instant reservation verification codes backed by Firestore transactions.
            </p>
          </div>
        </div>
      </section>

      {/* Dark Navy Portal Showcase Section */}
      <section className="py-20 bg-surface-dark text-on-dark border-t border-b border-hairline/10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Context */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-teal/20 bg-accent-teal/5 text-accent-teal text-xs font-bold uppercase tracking-wider">
                Role-Based Workspaces
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-normal tracking-[-1px] text-on-dark leading-tight">
                Designed for Every Participant
              </h2>
              <p className="text-on-dark-soft text-sm leading-relaxed">
                Whether you are booking traditional Bihu entry tickets, managing corporate guest registrations, or supervising regional user settings, Xobha Events provides custom portal workspaces built on Firebase security.
              </p>
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-accent-teal/10 flex items-center justify-center text-accent-teal shrink-0 mt-0.5">✓</div>
                  <div>
                    <h4 className="font-serif text-base font-normal text-on-dark">Attendee Portal</h4>
                    <p className="text-on-dark-soft text-xs">Verify ticket check-ins, cancel active bookings, and view regional event histories.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-accent-teal/10 flex items-center justify-center text-accent-teal shrink-0 mt-0.5">✓</div>
                  <div>
                    <h4 className="font-serif text-base font-normal text-on-dark">Organizer Analytics</h4>
                    <p className="text-on-dark-soft text-xs">Publish listings, track sales revenue, and manage guest check-ins in real-time.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Mockup Panel */}
            <div className="lg:col-span-7 bg-surface-dark-elevated border border-hairline/10 rounded-2xl p-6 shadow-2xl font-mono text-xs text-on-dark-soft space-y-6">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-hairline/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-destructive/80"></span>
                  <span className="h-3 w-3 rounded-full bg-accent-amber/80"></span>
                  <span className="h-3 w-3 rounded-full bg-success/80"></span>
                  <span className="text-[10px] text-on-dark-soft/70 pl-2">xobha-console // database-check-in</span>
                </div>
                <span className="text-[10px] text-accent-teal">ACTIVE SESSION</span>
              </div>

              {/* Code window mock data */}
              <div className="space-y-4 leading-relaxed">
                <div className="space-y-1">
                  <p className="text-accent-amber">$ get-event-analytics --id=&quot;bihu-expo-2026&quot;</p>
                  <p className="text-on-dark/95">{"{"}</p>
                  <p className="pl-4">&quot;event&quot;: <span className="text-accent-teal">&quot;Assam Rongali Bihu Exhibition&quot;</span>,</p>
                  <p className="pl-4">&quot;location&quot;: &quot;Guwahati, Assam&quot;,</p>
                  <p className="pl-4">&quot;capacity&quot;: 500,</p>
                  <p className="pl-4">&quot;ticketsSold&quot;: 384,</p>
                  <p className="pl-4">&quot;occupancy&quot;: <span className="text-success">&quot;76.8%&quot;</span></p>
                  <p className="text-on-dark/95">{"}"}</p>
                </div>

                <div className="border-t border-hairline/10 pt-4 space-y-2">
                  <p className="text-accent-amber">$ list-registrations --checked-in=true</p>
                  <div className="grid grid-cols-4 border-b border-hairline/5 pb-1 text-[10px] text-on-dark/40 font-bold uppercase tracking-wider">
                    <span>Guest</span>
                    <span>Seats</span>
                    <span>Paid</span>
                    <span className="text-right">Status</span>
                  </div>
                  <div className="grid grid-cols-4 py-1 text-on-dark/85">
                    <span>Priyanuj B.</span>
                    <span>2</span>
                    <span>₹500</span>
                    <span className="text-success text-right">✓ CHECKED IN</span>
                  </div>
                  <div className="grid grid-cols-4 py-1 text-on-dark/85">
                    <span>Barsha D.</span>
                    <span>1</span>
                    <span>₹250</span>
                    <span className="text-success text-right">✓ CHECKED IN</span>
                  </div>
                  <div className="grid grid-cols-4 py-1 text-on-dark/85">
                    <span>Himanshu D.</span>
                    <span>3</span>
                    <span>₹750</span>
                    <span className="text-accent-amber text-right">⏳ PENDING</span>
                  </div>
                </div>
              </div>

              {/* Terminal footer */}
              <div className="flex justify-between items-center text-[10px] text-on-dark-soft/50 pt-2 border-t border-hairline/10">
                <span>Database: Firestore-Native</span>
                <span>Region: asia-south1 (Mumbai)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 bg-canvas border-b border-hairline">
        <div className="container mx-auto px-4 max-w-5xl space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-normal tracking-[-1px] text-ink">Featured Happenings</h2>
              <p className="text-muted-foreground text-sm">Upcoming events in Assam and Northeast India</p>
            </div>
            <Link href="/events" className={cn(buttonVariants({ variant: "ghost" }), "text-primary font-bold hover:bg-primary/10")}>
              View All Happenings &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12 w-full col-span-1 md:col-span-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="col-span-1 md:col-span-3 text-center py-12 px-6 bg-surface-card border border-hairline rounded-xl shadow-sm max-w-lg mx-auto w-full">
              <Calendar className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
              <h4 className="font-serif text-xl font-normal text-ink mb-1">No Featured Events Yet</h4>
              <p className="text-muted-foreground text-sm mb-4">
                Be the first to list an event, wedding, or cultural gathering in Northeast India!
              </p>
              <Link href="/register" className={cn(buttonVariants({ size: "sm" }), "bg-primary hover:bg-primary-active text-on-primary font-semibold")}>
                Get Started
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredEvents.map((event) => {
                const dateObj = new Date(event.date);
                const formattedDate = dateObj.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <div key={event.id} className="flex flex-col border border-hairline bg-surface-card rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="relative h-44 w-full bg-muted overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-3 right-3 bg-canvas/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
                        {event.price === 0 ? "FREE" : `₹${event.price}`}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-wider">
                          <Tag className="h-3 w-3" />
                          {event.category}
                        </div>
                        <h4 className="font-serif text-lg font-normal line-clamp-1 group-hover:text-primary transition-colors text-ink">
                          {event.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 pt-2 border-t border-hairline/50 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                          {formattedDate}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <Link href={`/events/detail?id=${event.id}`} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full mt-2 font-semibold border-hairline hover:bg-primary/10 hover:text-primary hover:border-primary/30")}>
                          Reserve a Spot
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Coral CTA Band */}
      <section className="py-16 bg-canvas">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-primary text-on-primary rounded-xl p-12 text-center space-y-6 shadow-lg">
            <h2 className="font-serif text-3xl md:text-5xl font-normal tracking-[-1px] text-white">
              Ready to Host Your Next Assembly?
            </h2>
            <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Join regional organizers publishing cultural festivals, corporate forums, and private weddings across Northeast India.
            </p>
            <div className="pt-2">
              <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "bg-canvas hover:bg-surface-card text-ink font-semibold border-none shadow-md hover:scale-105 transition-transform")}>
                Get Started as Organizer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
