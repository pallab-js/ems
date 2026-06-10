"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, MapPin, Ticket, ArrowUpRight, Search, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketCount: number;
  pricePaid: number;
  status: string;
  registeredAt: any;
}

export default function AttendeeDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (profile?.role !== "attendee") {
        router.push(`/dashboard/${profile?.role}`);
      }
    }
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "registrations"),
          where("attendeeId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetched: UserRegistration[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetched.push({
            id: doc.id,
            eventId: data.eventId,
            eventTitle: data.eventTitle,
            eventDate: data.eventDate,
            eventLocation: data.eventLocation,
            ticketCount: data.ticketCount,
            pricePaid: data.pricePaid,
            status: data.status,
            registeredAt: data.registeredAt,
          });
        });

        // Verify event existence and cancellation status in parallel
        const activeRegs: UserRegistration[] = [];
        const cancelledNotes: string[] = [];

        await Promise.all(
          fetched.map(async (reg) => {
            try {
              const eventSnap = await getDoc(doc(db, "events", reg.eventId));
              if (!eventSnap.exists()) {
                // Event was DELETED: disappears from attendee's dashboard
                return;
              }
              const eventData = eventSnap.data();
              if (eventData.status === "cancelled") {
                // Event was CANCELLED: add notification and show cancelled status
                cancelledNotes.push(`The event "${reg.eventTitle}" has been cancelled by the organizer.`);
                activeRegs.push({ ...reg, status: "cancelled" });
              } else {
                activeRegs.push(reg);
              }
            } catch (err) {
              console.error("Error checking event status for booking:", reg.id, err);
              activeRegs.push(reg);
            }
          })
        );

        setRegistrations(activeRegs);
        setNotifications(cancelledNotes);
      } catch (error) {
        console.error("Error fetching registrations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex-1 flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Attendee Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Welcome, {profile?.displayName}! View your booked tickets and upcoming events in Northeast India.
          </p>
        </div>
        <Link href="/events" className={cn(buttonVariants(), "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold")}>
          <Search className="mr-2 h-4 w-4" /> Find Events
        </Link>
      </div>

      {/* Notifications for cancelled events */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((note, index) => (
            <div key={index} className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3.5 rounded-xl flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {note}
              </span>
              <button 
                onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== index))}
                className="text-destructive hover:bg-destructive/10 p-1 rounded-full cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Card className="border-emerald-500/10">
        <CardHeader className="bg-muted/20 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Ticket className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Your Bookings
          </CardTitle>
          <CardDescription>
            A history of all your local event ticket reservations
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {registrations.length === 0 ? (
            <div className="text-center py-10 space-y-4">
              <p className="text-muted-foreground text-sm">
                You haven&apos;t booked any tickets yet. Explore Rongali Bihu summits and cultural expos!
              </p>
              <Link href="/events" className={cn(buttonVariants({ variant: "outline" }))}>
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.map((reg) => {
                const dateObj = new Date(reg.eventDate);
                const formattedDate = dateObj.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <div
                    key={reg.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-border rounded-xl hover:bg-muted/10 transition-colors gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-base hover:text-emerald-600 dark:hover:text-emerald-400">
                        <Link href={`/events/detail?id=${reg.eventId}`}>{reg.eventTitle}</Link>
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3 shrink-0" />
                          {formattedDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {reg.eventLocation}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Booking ID: {reg.id}</p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-border">
                      <div className="text-right space-y-0.5">
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                          {reg.status}
                        </span>
                        <p className="text-xs text-muted-foreground">{reg.ticketCount} {reg.ticketCount === 1 ? "seat" : "seats"}</p>
                        <p className="text-sm font-bold">{reg.pricePaid === 0 ? "FREE" : `₹${reg.pricePaid}`}</p>
                      </div>
                      <Link href={`/events/detail?id=${reg.eventId}`} className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "text-xs text-emerald-600 dark:text-emerald-400 gap-1")}>
                        View Event <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
