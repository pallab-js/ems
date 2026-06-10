"use client";

import React, { useState, useEffect } from "react";
import { useAuth, UserProfile, UserRole } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Event, MOCK_EVENTS } from "@/lib/mock-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Users, Calendar, Ticket, MapPin, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (profile?.role !== "admin") {
        router.push(`/dashboard/${profile?.role}`);
      }
    }
  }, [user, profile, authLoading, router]);

  const fetchAdminData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch all users
      const querySnapshotUsers = await getDocs(collection(db, "users"));
      const fetchedUsers: UserProfile[] = [];
      querySnapshotUsers.forEach((doc) => {
        fetchedUsers.push(doc.data() as UserProfile);
      });

      // If Firestore users are empty, seed current user as mock
      if (fetchedUsers.length === 0 && profile) {
        fetchedUsers.push(profile);
      }
      setUsers(fetchedUsers);

      // 2. Fetch all events
      const querySnapshotEvents = await getDocs(collection(db, "events"));
      const fetchedEvents: Event[] = [];
      querySnapshotEvents.forEach((doc) => {
        const data = doc.data();
        fetchedEvents.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
          location: data.location,
          district: data.district,
          category: data.category,
          image: data.image,
          organizerId: data.organizerId,
          organizerName: data.organizerName,
          capacity: data.capacity,
          availableTickets: data.availableTickets,
          price: data.price,
          status: data.status,
          createdAt: data.createdAt,
        });
      });

      if (fetchedEvents.length > 0) {
        setEvents(fetchedEvents);
      } else {
        setEvents(MOCK_EVENTS);
      }

      // 3. Fetch registrations count
      const querySnapshotRegs = await getDocs(collection(db, "registrations"));
      setRegistrationsCount(querySnapshotRegs.size);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      // Fallback
      setEvents(MOCK_EVENTS);
      if (profile) setUsers([profile]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && profile?.role === "admin") {
      fetchAdminData();
    }
  }, [user, profile]);

  const handleRoleChange = async (targetUserId: string, newRole: UserRole) => {
    setUpdatingRole(targetUserId);
    try {
      const userRef = doc(db, "users", targetUserId);
      await updateDoc(userRef, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.uid === targetUserId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      console.error("Error updating user role:", err);
      alert("Failed to update role: " + err.message);
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (eventId.startsWith("mock-")) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      return;
    }

    if (!confirm("Are you sure you want to delete this event?")) return;

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
      <div className="flex-grow flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex-1 flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Admin Console</h1>
        <p className="text-muted-foreground text-sm">
          Welcome, {profile?.displayName}! System control panel to manage users, event listings, and roles.
        </p>
      </div>

      {/* Admin stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-emerald-500/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Active Users</CardDescription>
            <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Total Events</CardDescription>
            <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{events.length}</div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Total Bookings</CardDescription>
            <Ticket className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{registrationsCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="users">Manage User Roles ({users.length})</TabsTrigger>
          <TabsTrigger value="events">All Event Listings ({events.length})</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="pt-4">
          <Card className="border-emerald-500/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Role-Based Access Control
              </CardTitle>
              <CardDescription>
                Revoke or grant Organizer and Admin status to registered accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Name</TableHead>
                      <TableHead>Email Address</TableHead>
                      <TableHead>User UID</TableHead>
                      <TableHead className="w-48 text-right">Assigned Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.uid}>
                        <TableCell className="font-bold text-xs">{u.displayName}</TableCell>
                        <TableCell className="text-xs">{u.email}</TableCell>
                        <TableCell className="text-[10px] font-mono text-muted-foreground">{u.uid}</TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={u.role}
                            onValueChange={(val) => handleRoleChange(u.uid, val as UserRole)}
                            disabled={updatingRole === u.uid}
                          >
                            <SelectTrigger className="w-36 ml-auto">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="attendee">Attendee</SelectItem>
                              <SelectItem value="organizer">Organizer</SelectItem>
                              <SelectItem value="admin">Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="pt-4">
          <Card className="border-emerald-500/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Event Directory
              </CardTitle>
              <CardDescription>
                Overview of all published regional gatherings and exhibitions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Title</TableHead>
                      <TableHead>Host Organizer</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-bold text-xs">
                          <Link href={`/events/${event.id}`} className="hover:text-emerald-600 dark:hover:text-emerald-400">
                            {event.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-xs">{event.organizerName}</TableCell>
                        <TableCell className="text-xs">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {event.district}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">{event.price === 0 ? "Free" : `₹${event.price}`}</TableCell>
                        <TableCell className="text-xs capitalize">
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {event.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteEvent(event.id)}
                            title="Delete Event"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
