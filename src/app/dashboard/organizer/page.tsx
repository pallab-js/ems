"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar as CalendarIcon, Plus, Users, Landmark, FileText, MapPin, Trash2 } from "lucide-react";

interface OrganizerEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  price: number;
  capacity: number;
  availableTickets: number;
  category: string;
}

interface OrganizerRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  attendeeName: string;
  attendeeEmail: string;
  ticketCount: number;
  pricePaid: number;
  registeredAt: any;
}

export default function OrganizerDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [registrations, setRegistrations] = useState<OrganizerRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (profile?.role !== "organizer" && profile?.role !== "admin") {
        router.push(`/dashboard/${profile?.role}`);
      }
    }
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    const fetchOrganizerData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // 1. Fetch organizer's events
        const qEvents = query(
          collection(db, "events"),
          where("organizerId", "==", user.uid)
        );
        const querySnapshotEvents = await getDocs(qEvents);
        const fetchedEvents: OrganizerEvent[] = [];
        const eventIds: string[] = [];

        querySnapshotEvents.forEach((doc) => {
          const data = doc.data();
          eventIds.push(doc.id);
          fetchedEvents.push({
            id: doc.id,
            title: data.title,
            date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
            location: data.location,
            price: data.price,
            capacity: data.capacity,
            availableTickets: data.availableTickets ?? data.capacity,
            category: data.category,
          });
        });
        setEvents(fetchedEvents);

        // 2. Fetch registrations for these events
        if (eventIds.length > 0) {
          const qRegs = collection(db, "registrations");
          const querySnapshotRegs = await getDocs(qRegs);
          const fetchedRegs: OrganizerRegistration[] = [];
          
          querySnapshotRegs.forEach((doc) => {
            const data = doc.data();
            if (eventIds.includes(data.eventId)) {
              fetchedRegs.push({
                id: doc.id,
                eventId: data.eventId,
                eventTitle: data.eventTitle,
                attendeeName: data.attendeeName,
                attendeeEmail: data.attendeeEmail,
                ticketCount: data.ticketCount,
                pricePaid: data.pricePaid,
                registeredAt: data.registeredAt,
              });
            }
          });
          setRegistrations(fetchedRegs);
        }
      } catch (error) {
        console.error("Error loading organizer dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrganizerData();
    }
  }, [user]);

  const totalEvents = events.length;
  const totalTicketsSold = registrations.reduce((sum, r) => sum + r.ticketCount, 0);
  const totalRevenue = registrations.reduce((sum, r) => sum + r.pricePaid, 0);

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to permanently delete this event listing?")) return;

    try {
      await deleteDoc(doc(db, "events", eventId));
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err: any) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event: " + err.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex-1 flex flex-col gap-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Organizer Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Welcome, {profile?.displayName}! Manage your events and track bookings in real time.
          </p>
        </div>
        <Link href="/dashboard/organizer/create" className={cn(buttonVariants(), "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold")}>
          <Plus className="mr-2 h-4 w-4" /> Create Event
        </Link>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-emerald-500/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Total Hosted Events</CardDescription>
            <CalendarIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{totalEvents}</div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Tickets Registered</CardDescription>
            <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{totalTicketsSold}</div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Gross Revenue</CardDescription>
            <Landmark className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">₹{totalRevenue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed list and tabs */}
      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="events">Your Events ({events.length})</TabsTrigger>
          <TabsTrigger value="registrations">Attendee Bookings ({registrations.length})</TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events" className="pt-4">
          <Card className="border-emerald-500/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Published Events
              </CardTitle>
              <CardDescription>
                Events currently visible to attendees looking for regional gatherings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground text-sm mb-4">You haven&apos;t created any events yet.</p>
                  <Link href="/dashboard/organizer/create" className={cn(buttonVariants())}>
                    Create your first event
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Title</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Tickets Sold</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event) => {
                        const dateObj = new Date(event.date);
                        return (
                          <TableRow key={event.id}>
                            <TableCell className="font-bold">{event.title}</TableCell>
                            <TableCell className="text-xs">{dateObj.toLocaleDateString("en-IN")}</TableCell>
                            <TableCell className="text-xs max-w-xs truncate">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                {event.location}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs">{event.price === 0 ? "Free" : `₹${event.price}`}</TableCell>
                            <TableCell className="text-xs">
                              {event.capacity - event.availableTickets} / {event.capacity}
                            </TableCell>
                            <TableCell className="text-right flex items-center justify-end gap-2">
                              <Link href={`/events/detail?id=${event.id}`} className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}>
                                View Page
                              </Link>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10 h-8 w-8"
                                onClick={() => handleDeleteEvent(event.id)}
                                title="Delete Event"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Registrations Tab */}
        <TabsContent value="registrations" className="pt-4">
          <Card className="border-emerald-500/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Registrations & Guest List
              </CardTitle>
              <CardDescription>
                Audience booking check-ins and payments for your events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {registrations.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No attendees have registered for your events yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Guest Name</TableHead>
                        <TableHead>Guest Email</TableHead>
                        <TableHead>Seats</TableHead>
                        <TableHead>Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations.map((reg) => (
                        <TableRow key={reg.id}>
                          <TableCell className="font-semibold text-xs">{reg.eventTitle}</TableCell>
                          <TableCell className="text-xs">{reg.attendeeName}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{reg.attendeeEmail}</TableCell>
                          <TableCell className="text-xs">{reg.ticketCount}</TableCell>
                          <TableCell className="text-xs font-bold">{reg.pricePaid === 0 ? "Free" : `₹${reg.pricePaid}`}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
