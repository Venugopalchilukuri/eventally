"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

export default function ImportEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<'url' | 'details'>('url');
  
  // Form state
  const [eventUrl, setEventUrl] = useState("");
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "Other",
    max_attendees: "",
    image_url: "",
    external_url: "", // Store original URL
  });

  // Detect platform from URL
  function detectPlatform(url: string): string {
    if (url.includes('facebook.com/events') || url.includes('fb.me')) return 'Facebook';
    if (url.includes('eventbrite.com') || url.includes('eventbrite.')) return 'Eventbrite';
    if (url.includes('meetup.com')) return 'Meetup';
    if (url.includes('google.com/calendar') || url.includes('calendar.google.com')) return 'Google Calendar';
    if (url.includes('linkedin.com/events')) return 'LinkedIn';
    if (url.includes('luma.com') || url.includes('lu.ma')) return 'Luma';
    return 'External';
  }

  // Extract basic info from URL (simple pattern matching)
  function extractInfoFromUrl(url: string) {
    const platform = detectPlatform(url);
    
    // Try to extract event title from URL path
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
    const titleGuess = lastPart
      .replace(/[-_]/g, ' ')
      .replace(/\?.*/, '')
      .replace(/#.*/, '')
      .trim();

    return {
      platform,
      titleGuess: titleGuess.charAt(0).toUpperCase() + titleGuess.slice(1),
    };
  }

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!eventUrl.trim()) {
      setError("Please enter an event URL");
      return;
    }

    // Validate URL format
    try {
      new URL(eventUrl);
    } catch {
      setError("Please enter a valid URL (must start with http:// or https://)");
      return;
    }

    const { platform, titleGuess } = extractInfoFromUrl(eventUrl);
    
    setEventData({
      ...eventData,
      title: titleGuess,
      external_url: eventUrl,
    });
    
    setStep('details');
    setError("");
  }

  async function handleEventSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      alert("Please log in to import events");
      router.push("/login");
      return;
    }

    // Validation
    if (!eventData.title || !eventData.description || !eventData.date || 
        !eventData.time || !eventData.location || !eventData.category) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: insertError } = await supabase
        .from("events")
        .insert({
          title: eventData.title,
          description: eventData.description + 
            `\n\n📎 Original Event: ${eventData.external_url}`,
          date: eventData.date,
          time: eventData.time,
          location: eventData.location,
          category: eventData.category,
          max_attendees: eventData.max_attendees ? parseInt(eventData.max_attendees) : null,
          image_url: eventData.image_url || null,
          user_id: user.id,
          current_attendees: 0,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      alert("Event imported successfully! 🎉");
      router.push(`/events/${data.id}`);
    } catch (err: any) {
      console.error("Error importing event:", err);
      setError(err.message || "Failed to import event");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Login Required
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please log in to import events
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            📎 Import External Event
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Share events from Google, Facebook, Eventbrite, and more!
          </p>
        </div>

        {/* Supported Platforms */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            ✨ Supported Platforms:
          </h3>
          <div className="flex flex-wrap gap-2 text-sm text-blue-700 dark:text-blue-400">
            <span className="px-3 py-1 bg-white dark:bg-blue-900/50 rounded-full">📘 Facebook Events</span>
            <span className="px-3 py-1 bg-white dark:bg-blue-900/50 rounded-full">🎟️ Eventbrite</span>
            <span className="px-3 py-1 bg-white dark:bg-blue-900/50 rounded-full">👥 Meetup</span>
            <span className="px-3 py-1 bg-white dark:bg-blue-900/50 rounded-full">📅 Google Calendar</span>
            <span className="px-3 py-1 bg-white dark:bg-blue-900/50 rounded-full">💼 LinkedIn</span>
            <span className="px-3 py-1 bg-white dark:bg-blue-900/50 rounded-full">🌐 Any URL</span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step === 'url' 
                ? 'bg-purple-600 text-white' 
                : 'bg-green-600 text-white'
            }`}>
              {step === 'url' ? '1' : '✓'}
            </div>
            <div className="w-20 h-1 bg-gray-300 dark:bg-gray-600 mx-2"></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step === 'details' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Step 1: Enter URL */}
        {step === 'url' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Step 1: Paste Event URL
            </h2>
            
            <form onSubmit={handleUrlSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event URL *
                </label>
                <input
                  type="url"
                  value={eventUrl}
                  onChange={(e) => setEventUrl(e.target.value)}
                  placeholder="https://facebook.com/events/123456789 or https://eventbrite.com/e/..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Copy the event link from Facebook, Eventbrite, Google Calendar, or any other platform
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  💡 How to get the event URL:
                </h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• <strong>Facebook:</strong> Open event → Click "Share" → Copy link</li>
                  <li>• <strong>Eventbrite:</strong> Open event → Copy URL from browser</li>
                  <li>• <strong>Google Calendar:</strong> Open event → Click "..." → Get shareable link</li>
                  <li>• <strong>Meetup:</strong> Open event → Copy URL from browser</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Next: Enter Event Details →
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Event Details */}
        {step === 'details' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Step 2: Complete Event Details
              </h2>
              <button
                onClick={() => setStep('url')}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                ← Back
              </button>
            </div>

            {/* Show detected URL */}
            <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <p className="text-sm text-purple-900 dark:text-purple-300">
                <strong>Importing from:</strong> {detectPlatform(eventData.external_url)}
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-400 mt-1 truncate">
                {eventData.external_url}
              </p>
            </div>

            <form onSubmit={handleEventSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={eventData.title}
                  onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                  placeholder="Tech Conference 2025"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={eventData.description}
                  onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                  placeholder="Enter event description, agenda, speakers, etc."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  The original event link will be automatically added to the description
                </p>
              </div>

              {/* Date and Time */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={eventData.date}
                    onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={eventData.time}
                    onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={eventData.location}
                  onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                  placeholder="Convention Center, Room 101 or Virtual (Zoom)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={eventData.category}
                  onChange={(e) => setEventData({ ...eventData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="Technology">🚀 Technology</option>
                  <option value="Business">💼 Business</option>
                  <option value="Entertainment">🎵 Entertainment</option>
                  <option value="Sports">🏃 Sports</option>
                  <option value="Art">🎨 Art</option>
                  <option value="Food">🍷 Food & Drink</option>
                  <option value="Education">📚 Education</option>
                  <option value="Other">🎯 Other</option>
                </select>
              </div>

              {/* Max Attendees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Attendees (Optional)
                </label>
                <input
                  type="number"
                  value={eventData.max_attendees}
                  onChange={(e) => setEventData({ ...eventData, max_attendees: e.target.value })}
                  placeholder="Leave blank for unlimited"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={eventData.image_url}
                  onChange={(e) => setEventData({ ...eventData, image_url: e.target.value })}
                  placeholder="https://example.com/event-image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Right-click on the event image → "Copy image address"
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Importing Event..." : "✓ Import Event to Eventally"}
              </button>
            </form>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Need help? Check our{" "}
            <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
              Import Guide
            </a>{" "}
            or{" "}
            <a href="/create" className="text-purple-600 hover:text-purple-700 font-medium">
              create your own event
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
