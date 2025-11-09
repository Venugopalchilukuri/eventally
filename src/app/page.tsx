"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import RecommendedEvents from "@/components/RecommendedEvents";
import LiveActivityFeed from "@/components/LiveActivityFeed";

export default function Home() {
  
  // Real stats from database
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    satisfactionRate: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      // Get total events count
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      // Get total users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Calculate satisfaction rate (events with registrations / total events)
      const { count: eventsWithRegistrations } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gt('current_attendees', 0);

      const satisfactionRate = eventsCount && eventsCount > 0
        ? Math.round((eventsWithRegistrations || 0) / eventsCount * 100)
        : 0;

      setStats({
        totalEvents: eventsCount || 0,
        totalUsers: usersCount || 0,
        satisfactionRate: satisfactionRate
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white">
              Create & Manage
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Amazing Events
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The all-in-one platform to organize, promote, and manage your events seamlessly. 
              From small meetups to large conferences.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/events" 
              className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all hover:scale-105 shadow-lg"
            >
              Browse Events
            </Link>
            <Link 
              href="/signup" 
              className="px-8 py-4 bg-white text-purple-600 border-2 border-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all hover:scale-105 shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32 grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Easy Scheduling
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create and schedule events in minutes with our intuitive interface. Set dates, times, and locations effortlessly.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Attendee Management
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Track RSVPs, manage guest lists, and communicate with attendees all in one place.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Analytics & Insights
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get detailed analytics on event performance, attendance rates, and engagement metrics.
            </p>
          </div>
        </div>

        {/* Live Activity + Personalized Recommendations */}
        <div className="mt-20 sm:mt-32">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Activity Feed - Compact Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <LiveActivityFeed />
            </div>
            
            {/* Recommended Events - Main Content */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <RecommendedEvents />
            </div>
          </div>
        </div>

        {/* Stats Section - Real Data */}
        <div className="mt-32 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">
                {stats.totalEvents > 0 ? `${stats.totalEvents}+` : '0'}
              </div>
              <div className="text-purple-100">Events Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">
                {stats.totalUsers > 0 ? `${stats.totalUsers}+` : '0'}
              </div>
              <div className="text-purple-100">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">
                {stats.satisfactionRate}%
              </div>
              <div className="text-purple-100">Event Engagement Rate</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2025 Eventally. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
