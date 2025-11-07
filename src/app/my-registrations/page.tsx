"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getUserRegistrations } from "@/lib/registrations";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import type { Event } from "@/lib/supabase";

export default function MyRegistrationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchRegistrations();
  }, [user, router]);

  async function fetchRegistrations() {
    if (!user) return;

    const result = await getUserRegistrations(user.id);
    if (result.success) {
      // Extract events from registrations
      const registeredEvents = result.data
        .map((reg: any) => reg.events)
        .filter((event: any) => event !== null);
      setEvents(registeredEvents);
    } else {
      setError(result.error || "Failed to load registrations");
    }
    setLoading(false);
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">My Registrations</h1>
          <p className="text-xl text-purple-100">
            Events you're registered to attend
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your registrations...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              You haven't registered for any events yet
            </p>
            <a
              href="/events"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Browse Events
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onUpdate={fetchRegistrations} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
