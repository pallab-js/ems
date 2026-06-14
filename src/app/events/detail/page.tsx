"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Event } from "@/lib/constants";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, MapPin, Tag, Users, ShieldAlert, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

function EventDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(1);
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError("Invalid Event ID.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);


      try {
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setEvent({
            id: docSnap.id,
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
        } else {
          setError("Event not found in our database.");
        }
      } catch (err: any) {
        console.error("Error loading event details:", err);
        setError(err.message || "Failed to load event.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      router.push("/login");
      return;
    }

    if (!event) return;

    if (profile?.role !== "attendee") {
      alert("Only attendees are allowed to register for events.");
      return;
    }

    if (ticketCount <= 0 || ticketCount > 5) {
      alert("You can only book between 1 and 5 tickets.");
      return;
    }

    setBooking(true);
    try {
      const eventRef = doc(db, "events", event.id);
      const newRegistrationRef = doc(collection(db, "registrations"));

      await runTransaction(db, async (transaction) => {
        const eventDoc = await transaction.get(eventRef);
        if (!eventDoc.exists()) {
          throw new Error("Event does not exist.");
        }

        const currentAvailable = Number(eventDoc.data().availableTickets ?? eventDoc.data().capacity ?? 0);
        if (ticketCount > currentAvailable) {
          throw new Error("Not enough tickets available.");
        }

        const regData = {
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.date,
          eventLocation: event.location,
          organizerId: event.organizerId,
          attendeeId: user.uid,
          attendeeName: profile.displayName || user.email,
          attendeeEmail: user.email,
          ticketCount: ticketCount,
          pricePaid: event.price * ticketCount,
          status: "confirmed",
          registeredAt: new Date().toISOString(),
        };

        transaction.set(newRegistrationRef, regData);
        transaction.update(eventRef, {
          availableTickets: currentAvailable - ticketCount,
        });
      });

      setEvent((prev) => prev ? { ...prev, availableTickets: Math.max(0, prev.availableTickets - ticketCount) } : null);
      setBookingSuccess(true);
      setDialogOpen(false);
    } catch (err: any) {
      console.error("Error booking tickets:", err);
      alert("Failed to complete booking: " + err.message);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center py-20 bg-canvas">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md bg-canvas">
        <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-normal text-ink mb-2">Error loading Event</h2>
        <p className="text-muted-foreground mb-6">{error || "Event detail empty"}</p>
        <Link href="/events" className={cn(buttonVariants({ variant: "default" }), "bg-primary hover:bg-primary-active text-on-primary")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Browse
        </Link>
      </div>
    );
  }

  const dateObj = new Date(event.date);
  const formattedDate = dateObj.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="container mx-auto px-4 py-8 flex-1 flex flex-col gap-6 max-w-4xl bg-canvas">
      <Link href="/events" className="text-primary hover:underline inline-flex items-center gap-1 text-sm font-semibold mb-2">
        <ArrowLeft className="h-4 w-4" /> Back to Events
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="relative h-64 md:h-96 w-full rounded-xl overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Tag className="h-3 w-3" />
                {event.category}
              </div>
              {event.status === "cancelled" && (
                <div className="inline-flex items-center gap-1.5 bg-destructive/10 text-destructive px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-fade-in">
                  <ShieldAlert className="h-3 w-3" />
                  Cancelled
                </div>
              )}
            </div>
            <h1 className={cn("font-serif text-3xl md:text-4xl font-normal tracking-[-1px] text-ink", event.status === "cancelled" && "line-through text-muted-foreground")}>{event.title}</h1>
            <p className="text-xs text-muted-foreground">Hosted by {event.organizerName}</p>
          </div>

          <div className="border-t border-b border-hairline py-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CalendarIcon className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-ink">Date and Time</p>
                <p className="text-muted-foreground text-xs">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-ink">Venue</p>
                  <p className="text-muted-foreground text-xs">{event.location} ({event.district})</p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location + ", " + event.district)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary hover:underline hover:text-primary-active shrink-0 pl-4"
                >
                  Get Directions &rarr;
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Users className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-ink">Capacity</p>
                <p className="text-muted-foreground text-xs">{event.availableTickets} tickets remaining out of {event.capacity} total seats</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="font-serif text-xl font-normal text-ink">About the Event</h3>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>
        </div>

        <div>
          <Card className="sticky top-24 border-hairline bg-surface-card shadow-md">
            <CardHeader className="bg-muted/30 pb-4">
              <CardDescription className="text-xs text-muted-foreground">Ticket Price</CardDescription>
              <CardTitle className="font-serif text-2xl font-normal text-primary">
                {event.price === 0 ? "FREE ENTRY" : `₹${event.price}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {event.status === "cancelled" ? (
                <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-center space-y-2 border border-destructive/20">
                  <ShieldAlert className="h-8 w-8 mx-auto animate-pulse" />
                  <p className="font-bold text-sm">Event Cancelled</p>
                  <p className="text-xs">This event has been cancelled by the host organizer. Registration is closed.</p>
                </div>
              ) : bookingSuccess ? (
                <div className="bg-primary/10 text-primary p-4 rounded-xl text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 mx-auto" />
                  <p className="font-bold text-sm">Booking Confirmed!</p>
                  <p className="text-xs">Your seats have been reserved. You can view details in your Dashboard.</p>
                  <Link href="/dashboard/attendee" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full text-xs justify-center border-hairline hover:bg-canvas")}>
                    Go to Dashboard
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p>✓ Instant confirmation on registration</p>
                    <p>✓ Tailored local hosting support</p>
                    <p>✓ Easily cancel reservations from your account</p>
                  </div>

                  {event.availableTickets <= 0 ? (
                    <Button className="w-full bg-muted text-muted-foreground" disabled>
                      SOLDOUT
                    </Button>
                  ) : authLoading ? (
                    <Button className="w-full" disabled>Loading user...</Button>
                  ) : !user ? (
                    <Link href="/login" className={cn(buttonVariants(), "w-full bg-primary hover:bg-primary-active text-on-primary justify-center")}>
                      Sign In to Book
                    </Link>
                  ) : profile?.role !== "attendee" ? (
                    <div className="text-center p-3 bg-muted border border-border rounded-lg text-xs text-muted-foreground font-medium">
                      Only attendees can book tickets. You are signed in as an {profile?.role || "organizer"}.
                    </div>
                  ) : (
                    <Button className="w-full bg-primary hover:bg-primary-active text-on-primary" onClick={() => setDialogOpen(true)}>
                      Book Tickets
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md border-hairline bg-surface-card">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-normal text-ink">Reserve Tickets</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Select the number of tickets you wish to book for &ldquo;{event.title}&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tickets" className="text-ink">Number of Tickets</Label>
              <Input
                id="tickets"
                type="number"
                min="1"
                max={Math.min(5, event.availableTickets)}
                required
                value={ticketCount}
                onChange={(e) => setTicketCount(Number(e.target.value))}
                className="border-hairline bg-canvas"
              />
              <p className="text-[10px] text-muted-foreground">Maximum 5 tickets per booking. {event.availableTickets} seats remaining.</p>
            </div>
            {event.price > 0 && (
              <div className="flex justify-between items-center bg-muted/40 p-3 rounded-lg text-sm">
                <span className="font-medium text-ink">Total Amount:</span>
                <span className="font-extrabold text-primary">₹{event.price * ticketCount}</span>
              </div>
            )}
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={booking} className="border-hairline hover:bg-canvas">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary-active text-on-primary" disabled={booking}>
                {booking ? "Confirming..." : "Confirm Booking"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function EventDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center py-20 bg-canvas">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    }>
      <EventDetailContent />
    </Suspense>
  );
}
