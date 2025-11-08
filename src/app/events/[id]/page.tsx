"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { 
  registerForEvent, 
  unregisterFromEvent, 
  checkIfRegistered,
  getEventRegistrations,
  type Registration 
} from "@/lib/registrations";
import type { Event } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import AddToCalendarButton from "@/components/AddToCalendarButton";
import SocialShareButtons from "@/components/SocialShareButtons";
import EventComments from "@/components/EventComments";
import SimilarEvents from "@/components/SimilarEvents";

const categoryEmojis: Record<string, string> = {
  Technology: "🚀",
  Business: "💼",
  Entertainment: "🎵",
  Sports: "🏃",
  Art: "🎨",
  Food: "🍷",
  Education: "📚",
  Other: "🎯",
};

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [attendees, setAttendees] = useState<Registration[]>([]);
  const [showAttendees, setShowAttendees] = useState(false);
  const [externalUrl, setExternalUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    if (user && event) {
      checkRegistrationStatus();
      if (event.user_id === user.id) {
        fetchAttendees();
      }
    }
  }, [user, event]);

  async function fetchEvent() {
    try {
      const { data, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (fetchError) throw fetchError;
      setEvent(data);
      
      // Extract external URL from description if it exists
      const urlMatch = data.description?.match(/📎 Original Event: (https?:\/\/[^\s]+)/);
      if (urlMatch) {
        setExternalUrl(urlMatch[1]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load event");
    } finally {
      setLoading(false);
    }
  }

  async function checkRegistrationStatus() {
    if (!user || !event) return;
    const registered = await checkIfRegistered(event.id, user.id);
    setIsRegistered(registered);
  }

  async function fetchAttendees() {
    if (!event) return;
    const result = await getEventRegistrations(event.id);
    if (result.success) {
      setAttendees(result.data);
    }
  }

  async function handleRegister() {
    if (!user || !event) {
      alert("Please log in to register for events");
      router.push("/login");
      return;
    }

    if (event.max_attendees && event.current_attendees >= event.max_attendees) {
      alert("Sorry, this event is full!");
      return;
    }

    setRegistering(true);
    const result = await registerForEvent(event.id, user.id, user.email!);

    if (result.success) {
      setIsRegistered(true);
      alert("Successfully registered for event! 🎉\nCheck your email for confirmation.");
      
      // Send confirmation email (non-blocking)
      fetch('/api/send-registration-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          userName: user.email?.split('@')[0],
          eventTitle: event.title,
          eventDate: event.date,
          eventTime: event.time,
          eventLocation: event.location,
          eventId: event.id,
        }),
      }).catch(err => console.error('Email notification failed:', err));
      
      fetchEvent();
      fetchAttendees();
    } else {
      alert("Failed to register: " + result.error);
    }
    setRegistering(false);
  }

  async function handleUnregister() {
    if (!user || !event) return;

    if (!confirm("Are you sure you want to unregister from this event?")) {
      return;
    }

    setRegistering(true);
    const result = await unregisterFromEvent(event.id, user.id);

    if (result.success) {
      setIsRegistered(false);
      alert("Successfully unregistered from event");
      fetchEvent();
      fetchAttendees();
    } else {
      alert("Failed to unregister: " + result.error);
    }
    setRegistering(false);
  }

  async function handleDelete() {
    if (!event || !user) return;

    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id);

      if (deleteError) throw deleteError;

      alert("Event deleted successfully!");
      router.push("/my-events");
    } catch (err: any) {
      alert("Failed to delete event: " + err.message);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatTime(timeString: string) {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading event...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Event Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error || "This event doesn't exist"}</p>
          <Link
            href="/events"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = user?.id === event.user_id;
  const isFull = event.max_attendees && event.current_attendees >= event.max_attendees;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Event Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Image */}
          {event.image_url ? (
            <div className="h-96 overflow-hidden relative">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to gradient if image fails
                  e.currentTarget.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'bg-gradient-to-br from-purple-500 to-blue-500 h-96 flex items-center justify-center';
                  fallback.innerHTML = `<div class="text-9xl">${categoryEmojis[event.category] || "🎯"}</div>`;
                  e.currentTarget.parentElement?.appendChild(fallback);
                }}
              />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 h-64 flex items-center justify-center">
              <div className="text-9xl">{categoryEmojis[event.category] || "🎯"}</div>
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-sm rounded-full font-medium">
                {event.category}
              </span>
              {isRegistered && (
                <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 text-sm rounded-full font-medium">
                  ✓ You're Registered
                </span>
              )}
              {isFull && (
                <span className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-sm rounded-full font-medium">
                  Event Full
                </span>
              )}
              {isCreator && (
                <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm rounded-full font-medium">
                  Your Event
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {event.title}
            </h1>

            {/* Event Info Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatDate(event.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatTime(event.time)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {event.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Attendees</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {event.current_attendees}
                      {event.max_attendees && ` / ${event.max_attendees}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                About This Event
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Social Sharing */}
            <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <SocialShareButtons
                event={{
                  id: event.id,
                  title: event.title,
                  description: event.description,
                  date: formatDate(event.date),
                  location: event.location,
                }}
              />
            </div>

            {/* Action Buttons */}
            {!isCreator && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-6">
                {/* External Event Notice */}
                {externalUrl && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">🔗</span>
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                          External Event
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          This event is hosted on an external platform. You can track it here and register on the original site.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {user ? (isRegistered ? "You're Registered! 🎉" : externalUrl ? "Interested in This Event?" : "Ready to Join?") : "Join This Event"}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {user ? (
                    isRegistered ? (
                      "You're all set! We'll send you a reminder 24 hours before the event."
                    ) : externalUrl ? (
                      "Track this event here and register on the original platform to attend."
                    ) : (
                      "Click below to register and get event reminders."
                    )
                  ) : (
                    "Sign in to register and receive event updates and reminders."
                  )}
                </p>
                <div className="flex flex-wrap gap-3">
                  {/* External Event - Show original platform button only when logged in */}
                  {externalUrl && user && (
                    <a
                      href={externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105 text-lg shadow-lg flex items-center gap-2"
                    >
                      <span>🔗</span>
                      Register on Original Platform
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  
                  {/* Internal Event or Track External */}
                  {user && (
                    isRegistered ? (
                      <button
                        onClick={handleUnregister}
                        disabled={registering}
                        className="px-6 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {registering ? "Unregistering..." : externalUrl ? "Stop Tracking" : "Unregister from Event"}
                      </button>
                    ) : (
                      !externalUrl && (
                        <button
                          onClick={handleRegister}
                          disabled={registering || !!isFull}
                          className="px-8 py-4 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg shadow-lg"
                        >
                          {registering ? "Registering..." : isFull ? "Event Full" : "✓ Register for This Event"}
                        </button>
                      )
                    )
                  )}
                  
                  {/* Track button for external events */}
                  {externalUrl && user && !isRegistered && (
                    <button
                      onClick={handleRegister}
                      disabled={registering}
                      className="px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {registering ? "Adding..." : "📌 Track This Event"}
                    </button>
                  )}

                  {!user && (
                    <Link
                      href="/login"
                      className="px-8 py-4 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all hover:scale-105 text-lg shadow-lg"
                    >
                      Login to Register
                    </Link>
                  )}

                  {/* Add to Calendar - Available to all users */}
                  <AddToCalendarButton
                    event={{
                      title: event.title,
                      description: event.description,
                      location: event.location,
                      startDate: event.date,
                      startTime: event.time,
                      eventId: event.id,
                    }}
                    className="min-w-[200px]"
                  />
                </div>
              </div>
            )}

            {/* Creator Actions */}
            {isCreator && (
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowAttendees(!showAttendees)}
                  className="flex-1 min-w-[200px] px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {showAttendees ? "Hide" : "View"} Attendees ({attendees.length})
                </button>
                <Link
                  href={`/edit-event/${event.id}`}
                  className="px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
                >
                  Edit Event
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-6 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Delete Event
                </button>
              </div>
            )}

            {/* Attendees List (for creators) */}
            {isCreator && showAttendees && (
              <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Registered Attendees
                </h2>
                {attendees.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">No one has registered yet</p>
                ) : (
                  <div className="space-y-3">
                    {attendees.map((attendee, index) => (
                      <div
                        key={attendee.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {attendee.user_email}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Registered {new Date(attendee.registered_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Similar Events Recommendations */}
            <SimilarEvents 
              currentEventId={eventId}
              eventCategory={event.category}
            />

            {/* Event Comments & Q&A Section */}
            <EventComments 
              eventId={eventId} 
              organizerUserId={event.user_id || ''} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
