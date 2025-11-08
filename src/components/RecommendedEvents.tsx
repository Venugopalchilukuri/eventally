"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getRecommendationsForUser, getTrendingEvents } from '@/lib/recommendations';
import type { Event } from '@/lib/supabase';
import EventCard from './EventCard';

interface RecommendationScore {
  event: Event;
  score: number;
  matchPercentage: number;
  reason: string;
}

interface RecommendationWithScore extends RecommendationScore {
  event: Event;
  score: number;
  matchPercentage: number;
  reason: string;
}

interface User {
  id: string;
}

export default function RecommendedEvents() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendationWithScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [user]);

  async function loadRecommendations() {
    try {
      setLoading(true);

      if (user) {
        // Get personalized recommendations for logged-in users
        const recs = await getRecommendationsForUser(user.id, 6);
        setRecommendations(recs);
      } else {
        // Show trending events for guests to create interest
        const trending = await getTrendingEvents(6);
        const trendingWithScores = trending.map(event => ({
          event,
          score: event.current_attendees,
          matchPercentage: 75,
          reason: 'Trending event'
        }));
        setRecommendations(trendingWithScores);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mt-16">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            {user ? '🎯 Recommended For You' : '🔥 Trending Events'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {user 
              ? 'Based on your interests and activity' 
              : 'See what\'s popular! Login for AI-powered recommendations'}
          </p>
        </div>
        
        {/* Login CTA for guests */}
        {!user && (
          <a
            href="/login"
            className="hidden md:flex px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg items-center gap-2"
          >
            <span>Login for More</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        )}
      </div>

      {/* Value Proposition Banner for Guests */}
      {!user && (
        <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                ✨ Want Personalized Event Recommendations?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Login to unlock AI-powered suggestions just for you! Get match percentages, see why events fit your interests, and never miss your perfect event.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="/login"
                  className="inline-flex px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md items-center gap-2"
                >
                  <span>Login Now</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    90% Matches
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Smart Suggestions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Email Alerts
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      {recommendations.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Events Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Check back soon for recommended events!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map(({ event, matchPercentage, reason }) => (
          <div key={event.id} className="relative">
            {/* Match Badge - Only for logged-in users */}
            {user && (
              <div className="absolute top-4 right-4 z-10">
                <div className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                  matchPercentage >= 80 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                    : matchPercentage >= 60
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600'
                }`}>
                  {matchPercentage}% Match
                </div>
              </div>
            )}

            {/* Event Card */}
            <EventCard event={event} onUpdate={loadRecommendations} />

            {/* Reason Badge - Only for logged-in users */}
            {user && (
              <div className="mt-2 px-3 py-1 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <p className="text-xs text-purple-700 dark:text-purple-300 text-center">
                  💡 {reason}
                </p>
              </div>
            )}
          </div>
        ))}
        </div>
      )}

      {/* Bottom CTA */}
      {recommendations.length >= 6 && (
        <div className="mt-8 text-center">
          {user ? (
            <a
              href="/events"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
            >
              Explore All Events →
            </a>
          ) : (
            <div className="space-y-4">
              <a
                href="/login"
                className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
              >
                Login to See Your Perfect Matches 🎯
              </a>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Or <a href="/events" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">explore all events</a> without personalization
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
