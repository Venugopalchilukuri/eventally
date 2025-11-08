"use client";

import { useEffect, useState } from 'react';
import { getSimilarEvents } from '@/lib/recommendations';
import type { Event } from '@/lib/supabase';
import Link from 'next/link';

interface SimilarEventsProps {
  currentEventId: string;
  eventCategory: string;
}

export default function SimilarEvents({ currentEventId, eventCategory }: SimilarEventsProps) {
  const [similarEvents, setSimilarEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSimilarEvents();
  }, [currentEventId, eventCategory]);

  async function loadSimilarEvents() {
    try {
      setLoading(true);
      const events = await getSimilarEvents(currentEventId, eventCategory, 3);
      setSimilarEvents(events);
    } catch (error) {
      console.error('Error loading similar events:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return null;
  }

  if (similarEvents.length === 0) {
    // Show a message encouraging browsing all events
    return (
      <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          💡 Discover More Events
        </h2>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border-2 border-dashed border-purple-200 dark:border-purple-700">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            No other upcoming events in this category yet. Check out all available events!
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md"
          >
            <span>Browse All Events</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  // Check if events are in same category
  const sameCategory = similarEvents.every(e => e.category === eventCategory);

  return (
    <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        💡 {sameCategory ? 'You Might Also Like' : 'More Events You May Enjoy'}
      </h2>
      {!sameCategory && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Not enough events in {eventCategory}. Here are some popular events from other categories.
        </p>
      )}

      <div className="space-y-4">
        {similarEvents.map((event, index) => {
          const similarity = sameCategory ? 90 - (index * 10) : 70 - (index * 10); // Adjust for cross-category
          
          return (
            <Link 
              key={event.id}
              href={`/events/${event.id}`}
              className="block group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all duration-200 hover:border-purple-500 dark:hover:border-purple-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {event.title}
                      </h3>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                        {similarity}% similar
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        📅 {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        📍 {event.location}
                      </span>
                      {event.current_attendees > 0 && (
                        <span className="flex items-center gap-1">
                          👥 {event.current_attendees} attending
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                      {event.category}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/events"
          className="inline-block px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          Explore All {eventCategory} Events →
        </Link>
      </div>
    </div>
  );
}
