"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ALL_LOCATIONS, CATEGORIES } from "@/lib/mock-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, Sparkles } from "lucide-react";

export default function CreateEventPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [district, setDistrict] = useState("");
  const [category, setCategory] = useState("");
  const [capacity, setCapacity] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const storageRef = ref(storage, `banners/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setImage(url);
    } catch (err: any) {
      console.error("Storage upload error:", err);
      setError("Failed to upload image: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (profile?.role !== "organizer" && profile?.role !== "admin") {
        router.push(`/dashboard/${profile?.role}`);
      }
    }
  }, [user, profile, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!user || !profile) {
      setError("You must be logged in to create an event.");
      setSubmitting(false);
      return;
    }

    if (!district || !category) {
      setError("Please select both a District and a Category.");
      setSubmitting(false);
      return;
    }

    const defaultImages: { [key: string]: string } = {
      "Bihu Utsav & Cultural": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=800&auto=format&fit=crop",
      "Wedding & Reception": "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop",
      "Corporate Summit & Tech": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop",
      "Exhibition & Mela": "https://images.unsplash.com/photo-1531266752426-aad472b7bbf4?q=80&w=800&auto=format&fit=crop",
      "Music Concert & Festival": "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800&auto=format&fit=crop",
      "Sports & Adventure": "https://images.unsplash.com/photo-1581859814481-03b517b77af4?q=80&w=800&auto=format&fit=crop",
    };

    const eventImageUrl = image || defaultImages[category] || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800&auto=format&fit=crop";

    try {
      const eventData = {
        title,
        description,
        date: new Date(date).toISOString(),
        location,
        district,
        category,
        image: eventImageUrl,
        organizerId: user.uid,
        organizerName: profile.displayName || user.email,
        capacity: Number(capacity),
        availableTickets: Number(capacity),
        price: Number(price),
        status: "published",
        createdAt: new Date(),
      };

      await addDoc(collection(db, "events"), eventData);
      router.push("/dashboard/organizer");
    } catch (err: any) {
      console.error("Error creating event:", err);
      setError(err.message || "Failed to create event.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex-1 flex flex-col gap-4 max-w-2xl">
      <Link href="/dashboard/organizer" className="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 text-sm font-semibold mb-2">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <Card className="shadow-lg border-emerald-500/10">
        <CardHeader className="space-y-1 bg-gradient-to-r from-emerald-950/10 to-transparent border-b border-border/50 pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Create New Event
          </CardTitle>
          <CardDescription>
            Publish cultural and business gatherings in Assam & Northeast India
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                placeholder="e.g. Guwahati Rongali Bihu Exhibition"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Event Description</Label>
              <textarea
                id="description"
                rows={4}
                placeholder="Details about the event, scheduled performances, stall details, etc."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date and Time</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(val) => val && setCategory(val)} disabled={submitting}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Specific Venue / Address</Label>
                <Input
                  id="location"
                  placeholder="e.g. Latasil Playground, Uzan Bazar"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District / Location</Label>
                <Select value={district} onValueChange={(val) => val && setDistrict(val)} disabled={submitting}>
                  <SelectTrigger id="district">
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (Total Seats)</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="e.g. 500"
                  min="1"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Ticket Price (₹) (0 for Free)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g. 250"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageFile">Event Banner Image</Label>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={submitting || uploading}
                  className="cursor-pointer"
                />
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt="Cover preview"
                    className="h-10 w-16 object-cover rounded border border-border shadow-sm shrink-0"
                  />
                )}
              </div>
              {uploading && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 animate-pulse">Uploading cover image to Firebase Storage...</p>
              )}
              {!image && (
                <p className="text-[10px] text-muted-foreground">Upload a banner or leave empty to use a high-quality category default.</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-border/50 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/organizer")} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={submitting}>
              {submitting ? "Publishing..." : "Publish Event"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
