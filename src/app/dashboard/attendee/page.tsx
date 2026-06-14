"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot, doc, runTransaction } from "firebase/firestore";
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
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancelBooking = async (reg: UserRegistration) => {
    if (!confirm(`Are you sure you want to cancel your booking for "${reg.eventTitle}"? This will release your reserved seats.`)) {
      return;
    }

    setCancellingId(reg.id);
    try {
      const regRef = doc(db, "registrations", reg.id);
      const eventRef = doc(db, "events", reg.eventId);

      await runTransaction(db, async (transaction) => {
        const regDoc = await transaction.get(regRef);
        if (!regDoc.exists()) {
          throw new Error("Registration booking not found.");
        }

        if (regDoc.data().status !== "confirmed") {
          throw new Error("This booking has already been cancelled.");
        }

        const eventDoc = await transaction.get(eventRef);
        if (!eventDoc.exists()) {
          throw new Error("The associated event does not exist.");
        }

        const currentAvailable = Number(eventDoc.data().availableTickets ?? eventDoc.data().capacity ?? 0);

        // Update registration status
        transaction.update(regRef, { status: "cancelled" });

        // Restore tickets to event capacity
        transaction.update(eventRef, {
          availableTickets: currentAvailable + reg.ticketCount,
        });
      });

      alert("Booking successfully cancelled. Your seats have been refunded.");
    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      alert("Failed to cancel booking: " + err.message);
    } finally {
      setCancellingId(null);
    }
  };

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
    if (!user) return;
    setLoading(true);

    const q = query(
      collection(db, "registrations"),
      where("attendeeId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetched: UserRegistration[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetched.push({
            id: docSnap.id,
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

        const activeRegs = fetched;
        const cancelledNotes: string[] = [];
        fetched.forEach((reg) => {
          if (reg.status === "cancelled") {
            cancelledNotes.push(`The event "${reg.eventTitle}" has been cancelled by the organizer.`);
          }
        });

        setRegistrations(activeRegs);
        setNotifications(cancelledNotes);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to registrations:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-canvas">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex-1 flex flex-col gap-6 max-w-4xl bg-canvas">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-normal text-ink tracking-tight">
            Attendee Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Welcome, {profile?.displayName}! View your booked tickets and upcoming events in Northeast India.
          </p>
        </div>
        <Link href="/events" className={cn(buttonVariants(), "bg-primary hover:bg-primary-active text-on-primary font-semibold")}>
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

      <Card className="border-hairline bg-surface-card">
        <CardHeader className="bg-muted/20 pb-4">
          <CardTitle className="font-serif text-lg font-normal text-ink flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Your Bookings
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            A history of all your local event ticket reservations
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {registrations.length === 0 ? (
            <div className="text-center py-10 space-y-4">
              <p className="text-muted-foreground text-sm">
                You haven&apos;t booked any tickets yet. Explore Rongali Bihu summits and cultural expos!
              </p>
              <Link href="/events" className={cn(buttonVariants({ variant: "outline" }), "border-hairline hover:bg-canvas")}>
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
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-hairline/60 rounded-xl hover:bg-muted/10 transition-colors gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="font-serif text-base font-normal text-ink hover:text-primary">
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

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-hairline">
                      <div className="text-right space-y-0.5">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
                          reg.status === "cancelled"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary"
                        )}>
                          {reg.status}
                        </span>
                        <p className="text-xs text-muted-foreground">{reg.ticketCount} {reg.ticketCount === 1 ? "seat" : "seats"}</p>
                        <p className="text-sm font-bold text-ink">{reg.pricePaid === 0 ? "FREE" : `₹${reg.pricePaid}`}</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        {reg.status === "confirmed" && (
                          <button
                            onClick={() => handleCancelBooking(reg)}
                            disabled={cancellingId === reg.id}
                            className="text-xs font-semibold text-destructive hover:underline p-1 rounded hover:bg-destructive/5 shrink-0 transition-colors"
                          >
                            {cancellingId === reg.id ? "Cancelling..." : "Cancel Booking"}
                          </button>
                        )}
                        <Link href={`/events/detail?id=${reg.eventId}`} className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "text-xs text-primary hover:text-primary-active gap-1 hover:bg-primary/10")}>
                          View Event <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
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
