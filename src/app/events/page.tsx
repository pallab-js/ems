"use client";

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Event, ALL_LOCATIONS, CATEGORIES } from "@/lib/constants";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { MapPin, Calendar as CalendarIcon, Tag, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "events"), where("status", "==", "published"));
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

      setEvents(fetched);
    } catch (error) {
      console.warn("Firestore error fetching events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = 
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "all" || event.category === selectedCategory;
      
    const matchesLocation = 
      selectedLocation === "all" || 
      event.district === selectedLocation || 
      event.location.includes(selectedLocation);

    return matchesSearch && matchesCategory && matchesLocation;
  });

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedLocation("all");
  };

  return (
    <div className="container mx-auto px-4 py-8 flex-1 flex flex-col gap-6 bg-canvas">
      {/* Banner */}
      <div className="text-center py-6 md:py-10 bg-surface-soft rounded-xl border border-hairline">
        <h1 className="font-serif text-3xl md:text-5xl font-normal tracking-[-1px] mb-3 text-ink">
          Discover Local Events
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
          Find Rongali Bihu celebrations, corporate summits, weddings, and traditional exhibitions in Assam and the Northeast.
        </p>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-surface-card p-4 rounded-xl border border-hairline">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={(val) => val && setSelectedCategory(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Location Filter */}
        <Select value={selectedLocation} onValueChange={(val) => val && setSelectedLocation(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {ALL_LOCATIONS.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        <Button variant="outline" onClick={resetFilters} className="w-full">
          Clear Filters
        </Button>
      </div>


      {/* Loading state */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex-1 text-center py-20 bg-surface-soft rounded-xl border border-dashed border-hairline">
          <h3 className="text-xl font-bold mb-2">No Events Found</h3>
          <p className="text-muted-foreground mb-4">Try refining your search terms or filters.</p>
          <Button onClick={resetFilters}>Reset All Filters</Button>
        </div>
      ) : (
        /* Events Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const dateObj = new Date(event.date);
            const formattedDate = dateObj.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <Card key={event.id} className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow group border-hairline bg-surface-card">
                {/* Event Image */}
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-canvas/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold shadow-sm text-foreground">
                    {event.price === 0 ? (
                      <span className="text-primary font-bold">FREE</span>
                    ) : (
                      <span>₹{event.price}</span>
                    )}
                  </div>
                </div>

                <CardHeader className="p-4 pb-2 space-y-1">
                  <div className="flex items-center gap-1 text-xs text-primary font-semibold uppercase tracking-wider">
                    <Tag className="h-3 w-3" />
                    {event.category}
                  </div>
                  <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors text-ink font-serif font-normal">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs text-muted-foreground">
                    {event.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-0 pb-4 flex-1 flex flex-col justify-end gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                    <span className="text-xs">{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                    <span className="text-xs line-clamp-1">{event.location}</span>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 border-t border-hairline/40 bg-muted/10 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {event.availableTickets} / {event.capacity} left
                  </span>
                  <Link href={`/events/detail?id=${event.id}`} className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "text-primary hover:text-primary-active font-bold hover:bg-primary/10 gap-1")}>
                    View Details &rarr;
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
