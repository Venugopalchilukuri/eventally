"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { registerForEvent, unregisterFromEvent, checkIfRegistered } from "@/lib/registrations";
import { getEventEngagement, toggleEventLike, type EventEngagement } from "@/lib/eventEngagement";
import type { Event } from "@/lib/supabase";
import AddToCalendarButton from "./AddToCalendarButton";
import SocialShareButtons from "./SocialShareButtons";

interface EventCardProps {
  event: Event;
  onUpdate?: () => void;
  showActions?: boolean;
}

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

export default function EventCard({ event, onUpdate, showActions = true }: EventCardProps) {
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [engagement, setEngagement] = useState<EventEngagement>({
    likesCount: 0,
    commentsCount: 0,
    liked: false,
  });
  const [likingInProgress, setLikingInProgress] = useState(false);
  
  // Check if this is an external event
  const isExternalEvent = event.description?.includes('📎 Original Event:');

  useEffect(() => {
    if (user && showActions) {
      checkRegistrationStatus();
    } else {
      setCheckingRegistration(false);
    }
    loadEngagement();
  }, [user, event.id]);

  async function loadEngagement() {
    try {
      const stats = await getEventEngagement(event.id, user?.id);
      if (stats) {
        setEngagement(stats);
      }
    } catch (error) {
      console.error('Error loading engagement:', error);
    }
  }

  async function checkRegistrationStatus() {
    if (!user) return;
    const registered = await checkIfRegistered(event.id, user.id);
    setIsRegistered(registered);
    setCheckingRegistration(false);
  }

  async function handleRegister() {
    if (!user) {
      alert("Please log in to register for events");
      return;
    }

    // Check if event is full
    if (event.max_attendees && event.current_attendees >= event.max_attendees) {
      alert("Sorry, this event is full!");
      return;
    }

    setLoading(true);
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
      
      onUpdate?.();
    } else {
      alert("Failed to register: " + result.error);
    }
    setLoading(false);
  }

  async function handleUnregister() {
    if (!user) return;

    if (!confirm("Are you sure you want to unregister from this event?")) {
      return;
    }

    setLoading(true);
    const result = await unregisterFromEvent(event.id, user.id);

    if (result.success) {
      setIsRegistered(false);
      alert("Successfully unregistered from event");
      onUpdate?.();
    } else {
      alert("Failed to unregister: " + result.error);
    }
    setLoading(false);
  }

  async function handleLike() {
    if (!user) {
      alert("Please log in to like events");
      return;
    }

    setLikingInProgress(true);
    const result = await toggleEventLike(event.id, user.id);

    if (result.success) {
      setEngagement({
        ...engagement,
        liked: result.liked,
        likesCount: result.likesCount,
      });
    }
    setLikingInProgress(false);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
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

  const isFull = event.max_attendees && event.current_attendees >= event.max_attendees;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
      {event.image_url ? (
        <div className="h-48 overflow-hidden relative">
          <img 
            src={event.image_url} 
            alt={event.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback to gradient if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.className = 'bg-gradient-to-br from-purple-500 to-blue-500 h-48 flex items-center justify-center text-8xl';
              e.currentTarget.parentElement!.textContent = categoryEmojis[event.category] || "🎯";
            }}
          />
        </div>
      ) : (
        <div className="bg-gradient-to-br from-purple-500 to-blue-500 h-48 flex items-center justify-center text-8xl">
          {categoryEmojis[event.category] || "🎯"}
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-sm rounded-full font-medium">
            {event.category}
          </span>
          {isExternalEvent && (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm rounded-full font-medium">
              🔗 External
            </span>
          )}
          {isRegistered && (
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 text-sm rounded-full font-medium">
              ✓ {isExternalEvent ? 'Tracking' : 'Registered'}
            </span>
          )}
          {isFull && !isExternalEvent && (
            <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-sm rounded-full font-medium">
              Full
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {event.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>
        <div className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTime(event.time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>
              {event.current_attendees}
              {event.max_attendees && ` / ${event.max_attendees}`} attendees
            </span>
          </div>
        </div>

        {/* Engagement Section - Likes and Comments */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-sm">
          <button
            onClick={handleLike}
            disabled={likingInProgress || !user}
            className={`flex items-center gap-1.5 transition-all ${
              engagement.liked
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500'
            } disabled:opacity-50 disabled:cursor-not-allowed group`}
            title={user ? (engagement.liked ? 'Unlike' : 'Like this event') : 'Login to like'}
          >
            <svg
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                engagement.liked ? 'fill-current' : ''
              }`}
              fill={engagement.liked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={engagement.liked ? 0 : 2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="font-medium">{engagement.likesCount}</span>
          </button>

          <Link
            href={`/events/${event.id}#comments`}
            className="flex items-center gap-1.5 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors group"
          >
            <svg
              className="w-5 h-5 transition-transform group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="font-medium">{engagement.commentsCount}</span>
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex gap-2">
            <Link
              href={`/events/${event.id}`}
              className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center"
            >
              View Details
            </Link>
            <SocialShareButtons
              event={{
                id: event.id,
                title: event.title,
                description: event.description,
                date: formatDate(event.date),
                location: event.location,
              }}
              compact={true}
            />
            <AddToCalendarButton
              event={{
                title: event.title,
                description: event.description,
                location: event.location,
                startDate: event.date,
                startTime: event.time,
                eventId: event.id,
              }}
              compact={true}
            />
          </div>

          {showActions && user && (
            <>
              {checkingRegistration ? (
                <button
                  disabled
                  className="w-full px-4 py-3 bg-gray-400 text-white rounded-lg font-semibold cursor-not-allowed"
                >
                  Checking...
                </button>
              ) : isRegistered ? (
                <button
                  onClick={handleUnregister}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Unregistering..." : "Unregister"}
                </button>
              ) : (
                <Link
                  href={`/events/${event.id}`}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors text-center block ${
                    isFull && !isExternalEvent
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : isExternalEvent
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isExternalEvent ? "View & Register →" : isFull ? "Event Full" : "Register for Event"}
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
