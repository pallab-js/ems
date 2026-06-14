"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ALL_LOCATIONS, CATEGORIES } from "@/lib/constants";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, Sparkles } from "lucide-react";

function EditEventContent() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [district, setDistrict] = useState("");
  const [category, setCategory] = useState("");
  const [capacity, setCapacity] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [originalEvent, setOriginalEvent] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
    const fetchEvent = async () => {
      if (!id || !user) return;
      try {
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Security check: only organizer or admin can edit
          if (data.organizerId !== user.uid && profile?.role !== "admin") {
            setError("You do not have permission to edit this event.");
            setLoadingEvent(false);
            return;
          }
          setOriginalEvent({ id: docSnap.id, ...data });
          setTitle(data.title);
          setDescription(data.description);
          
          // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
          let dateStr = "";
          if (data.date) {
            const dateObj = new Date(data.date);
            // offset timezone to match local timezone input
            const tzOffset = dateObj.getTimezoneOffset() * 60000;
            const localISOTime = new Date(dateObj.getTime() - tzOffset).toISOString().slice(0, 16);
            dateStr = localISOTime;
          }
          setDate(dateStr);
          setLocation(data.location);
          setDistrict(data.district);
          setCategory(data.category);
          setCapacity(String(data.capacity));
          setPrice(String(data.price));
          setImage(data.image || "");
        } else {
          setError("Event not found.");
        }
      } catch (err: any) {
        console.error("Error loading event:", err);
        setError("Failed to load event details: " + err.message);
      } finally {
        setLoadingEvent(false);
      }
    };

    if (user && id) {
      fetchEvent();
    }
  }, [id, user, profile]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!user || !profile || !originalEvent) {
      setError("Authorization error. Please try again.");
      setSubmitting(false);
      return;
    }

    if (!district || !category) {
      setError("Please select both a District and a Category.");
      setSubmitting(false);
      return;
    }

    const inputCapacity = Number(capacity);
    const inputPrice = Number(price);

    if (inputCapacity <= 0) {
      setError("Capacity must be a positive number.");
      setSubmitting(false);
      return;
    }

    // Capacity validation: capacity cannot be less than tickets already sold
    const soldTickets = originalEvent.capacity - (originalEvent.availableTickets ?? originalEvent.capacity);
    if (inputCapacity < soldTickets) {
      setError(`Capacity cannot be reduced below the number of registered tickets sold: ${soldTickets} seat(s) booked.`);
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
    const newAvailableTickets = inputCapacity - soldTickets;

    try {
      const eventRef = doc(db, "events", id);
      const updatedData = {
        title,
        description,
        date: new Date(date).toISOString(),
        location,
        district,
        category,
        image: eventImageUrl,
        capacity: inputCapacity,
        availableTickets: newAvailableTickets,
        price: inputPrice,
      };

      await updateDoc(eventRef, updatedData);
      router.push("/dashboard/organizer");
    } catch (err: any) {
      console.error("Error updating event:", err);
      setError(err.message || "Failed to update event.");
      setSubmitting(false);
    }
  };

  if (authLoading || loadingEvent) {
    return (
      <div className="flex-grow flex items-center justify-center py-20 bg-canvas">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !originalEvent) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl bg-canvas text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="font-serif text-2xl text-ink">Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <Link href="/dashboard/organizer" className="text-primary font-semibold hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex-1 flex flex-col gap-4 max-w-2xl bg-canvas">
      <Link href="/dashboard/organizer" className="text-primary hover:underline inline-flex items-center gap-1 text-sm font-semibold mb-2">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <Card className="shadow-md border-hairline bg-surface-card">
        <CardHeader className="space-y-1 border-b border-hairline pb-4">
          <CardTitle className="font-serif text-2xl font-normal text-ink flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Edit Event Listings
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Modify details for &ldquo;{originalEvent?.title}&rdquo;
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
              <Label htmlFor="title" className="text-ink text-xs font-semibold">Event Title</Label>
              <Input
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitting}
                className="border-hairline bg-canvas text-ink"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-ink text-xs font-semibold">Event Description</Label>
              <textarea
                id="description"
                rows={4}
                className="flex w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-ink"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-ink text-xs font-semibold">Date and Time</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={submitting}
                  className="border-hairline bg-canvas text-ink"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-ink text-xs font-semibold">Category</Label>
                <Select value={category} onValueChange={(val) => val && setCategory(val)} disabled={submitting}>
                  <SelectTrigger id="category" className="border-hairline bg-canvas text-ink">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="border-hairline bg-surface-card text-ink">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-ink text-xs font-semibold">Specific Venue / Address</Label>
                <Input
                  id="location"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={submitting}
                  className="border-hairline bg-canvas text-ink"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district" className="text-ink text-xs font-semibold">District / Location</Label>
                <Select value={district} onValueChange={(val) => val && setDistrict(val)} disabled={submitting}>
                  <SelectTrigger id="district" className="border-hairline bg-canvas text-ink">
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent className="border-hairline bg-surface-card text-ink">
                    {ALL_LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-ink text-xs font-semibold">Capacity (Total Seats)</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  disabled={submitting}
                  className="border-hairline bg-canvas text-ink"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-ink text-xs font-semibold">Ticket Price (₹) (0 for Free)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={submitting}
                  className="border-hairline bg-canvas text-ink"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageFile" className="text-ink text-xs font-semibold">Event Banner Image</Label>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={submitting || uploading}
                  className="cursor-pointer border-hairline bg-canvas text-ink"
                />
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt="Cover preview"
                    className="h-10 w-16 object-cover rounded border border-hairline shadow-sm shrink-0"
                  />
                )}
              </div>
              {uploading && (
                <p className="text-xs text-primary animate-pulse">Uploading cover image to Firebase Storage...</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-hairline pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/organizer")} disabled={submitting} className="border-hairline hover:bg-canvas">
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-active text-on-primary" disabled={submitting}>
              {submitting ? "Updating..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function EditEventPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center bg-canvas">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <EditEventContent />
    </Suspense>
  );
}
