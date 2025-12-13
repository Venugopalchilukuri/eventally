"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { registerForEvent, unregisterFromEvent, checkIfRegistered } from "@/lib/registrations";
import { getEventEngagement, toggleEventLike, type EventEngagement } from "@/lib/eventEngagement";
import type { Event } from "@/lib/supabase";
import AddToCalendarButton from "./AddToCalendarButton";
import SocialShareButtons from "./SocialShareButtons";
import BookmarkButton from "./BookmarkButton";
import EventCountdown from "./EventCountdown";
import EventStatusBadge from "./EventStatusBadge";
import ImageModal from "./ImageModal";

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
  const [showImageModal, setShowImageModal] = useState(false);

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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      if (user) {
        const { checkIsAdmin } = await import("@/lib/admin");
        const adminStatus = await checkIsAdmin(user.id);
        setIsAdmin(adminStatus);
      }
    }
    checkAdmin();
  }, [user]);

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden relative transform hover:-translate-y-2 hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-purple-500/20 dark:hover:border-purple-400/20">
      {/* Bookmark Button - Only for non-admin users */}
      {user && !isAdmin && (
        <div className="absolute top-3 right-3 z-10">
          <BookmarkButton
            eventId={event.id}
            eventTitle={event.title}
            size="md"
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg"
          />
        </div>
      )}
      {event.image_url ? (
        <div
          className="relative bg-gray-100 dark:bg-gray-700 w-full flex items-center justify-center p-3 cursor-pointer overflow-hidden"
          style={{ minHeight: '220px', maxHeight: '260px' }}
          onClick={() => setShowImageModal(true)}
        >
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

          <img
            src={event.image_url}
            alt={event.title}
            className="max-w-full max-h-full object-contain transition-all duration-500 group-hover:scale-110"
            style={{ width: 'auto', height: 'auto' }}
            onError={(e) => {
              // Fallback to gradient if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.className = 'bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-8xl';
              e.currentTarget.parentElement!.style.minHeight = '240px';
              e.currentTarget.parentElement!.textContent = categoryEmojis[event.category] || "🎯";
            }}
          />
          {/* Click hint overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center z-20">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 bg-white/95 dark:bg-gray-800/95 px-4 py-2 rounded-lg backdrop-blur-sm shadow-xl">
              <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                View Full Poster
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-8xl transition-all duration-300 group-hover:from-purple-600 group-hover:to-blue-600" style={{ minHeight: '240px' }}>
          <span className="transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
            {categoryEmojis[event.category] || "🎯"}
          </span>
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-sm rounded-full font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-purple-200 dark:hover:bg-purple-800 cursor-default">
            {categoryEmojis[event.category]} {event.category}
          </span>
          {/* Show status badge to event owner */}
          {user && event.user_id === user.id && (
            <EventStatusBadge status={event.status} size="sm" />
          )}
          {isExternalEvent && (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm rounded-full font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg animate-pulse">
              🔗 External
            </span>
          )}
          {isRegistered && (
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 text-sm rounded-full font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg">
              ✓ {isExternalEvent ? 'Tracking' : 'Registered'}
            </span>
          )}
          {isFull && !isExternalEvent && (
            <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-sm rounded-full font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg animate-pulse">
              Full
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600">
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

        {/* Event Countdown Timer */}
        <div className="mt-4">
          <EventCountdown
            eventDate={event.date}
            eventTime={event.time}
            size="sm"
            showLabel={false}
          />
        </div>

        {/* Engagement Section - Likes and Comments */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-sm">
          <button
            onClick={handleLike}
            disabled={likingInProgress || !user}
            className={`flex items-center gap-1.5 transition-all ${engagement.liked
              ? 'text-red-500 hover:text-red-600'
              : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500'
              } disabled:opacity-50 disabled:cursor-not-allowed group`}
            title={user ? (engagement.liked ? 'Unlike' : 'Like this event') : 'Login to like'}
          >
            <svg
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${engagement.liked ? 'fill-current' : ''
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
              className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 text-center transform hover:scale-105 hover:shadow-lg"
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
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 disabled:opacity-50 transform hover:scale-105 hover:shadow-xl hover:shadow-red-500/50"
                >
                  {loading ? "Unregistering..." : "Unregister"}
                </button>
              ) : (
                <Link
                  href={`/events/${event.id}`}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition-all duration-300 text-center block transform hover:scale-105 hover:shadow-xl ${isFull && !isExternalEvent
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : isExternalEvent
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-purple-500/50'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:shadow-purple-500/50'
                    }`}
                >
                  {isExternalEvent ? "View & Register →" : isFull ? "Event Full" : "Register for Event"}
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {event.image_url && (
        <ImageModal
          imageUrl={event.image_url}
          title={event.title}
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
}
