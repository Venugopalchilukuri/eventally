"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSavedEvents } from "@/lib/savedEvents";
import EventCard from "@/components/EventCard";
import Link from "next/link";
import type { Event } from "@/lib/supabase";

interface SavedEventData {
    id: string;
    saved_at: string;
    event: Event;
}

export default function SavedEventsPage() {
    const { user } = useAuth();
    const [savedEvents, setSavedEvents] = useState<SavedEventData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            loadSavedEvents();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    async function loadSavedEvents() {
        setIsLoading(true);
        setError(null);

        const result = await getSavedEvents(user!.id);

        if (result.success) {
            setSavedEvents(result.data as SavedEventData[]);
        } else {
            setError(result.error || "Failed to load saved events");
        }

        setIsLoading(false);
    }

    // Refresh the list when an event is unsaved
    function handleEventUpdate() {
        loadSavedEvents();
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-16">
                        <svg
                            className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                            />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Sign in to view saved events
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Create an account or sign in to save events you're interested in
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link
                                href="/login"
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/signup"
                                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading saved events...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-16">
                        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                        <button
                            onClick={loadSavedEvents}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <svg
                            className="w-8 h-8 text-purple-600 dark:text-purple-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Saved Events
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        {savedEvents.length === 0
                            ? "You haven't saved any events yet"
                            : `You have ${savedEvents.length} saved ${savedEvents.length === 1 ? "event" : "events"}`}
                    </p>
                </div>

                {/* Empty State */}
                {savedEvents.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                        <svg
                            className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                            />
                        </svg>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No saved events yet
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Click the bookmark icon on any event to save it for later
                        </p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                        >
                            Browse Events
                        </Link>
                    </div>
                ) : (
                    /* Events Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedEvents.map(({ event, saved_at }) => (
                            <div key={event.id} className="relative">
                                <EventCard event={event} onUpdate={handleEventUpdate} />
                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                                    Saved {new Date(saved_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
