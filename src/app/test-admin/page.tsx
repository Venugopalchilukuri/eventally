"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function TestAdminPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  async function checkProfile() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setProfile(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Admin Setup Diagnostic
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
          {/* User Status */}
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              1. User Authentication
            </h2>
            {user ? (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
                <p className="text-green-800 dark:text-green-200">
                  ✅ You are logged in as: <strong>{user.email}</strong>
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  User ID: {user.id}
                </p>
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded">
                <p className="text-red-800 dark:text-red-200">
                  ❌ You are NOT logged in
                </p>
                <Link
                  href="/login"
                  className="text-purple-600 dark:text-purple-400 underline mt-2 inline-block"
                >
                  Go to Login →
                </Link>
              </div>
            )}
          </div>

          {/* Profile Table Status */}
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              2. Profiles Table
            </h2>
            {loading ? (
              <p className="text-gray-600 dark:text-gray-400">Checking...</p>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded">
                <p className="text-red-800 dark:text-red-200">
                  ❌ Error: {error}
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                  This likely means the profiles table doesn't exist yet.
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Run the SQL from ADMIN_SETUP.md in Supabase SQL Editor.
                </p>
              </div>
            ) : profile ? (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
                <p className="text-green-800 dark:text-green-200">
                  ✅ Profile found!
                </p>
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  <p>Email: {profile.email}</p>
                  <p>
                    Role: <strong>{profile.role}</strong>
                  </p>
                  <p>Created: {new Date(profile.created_at).toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded">
                <p className="text-yellow-800 dark:text-yellow-200">
                  ⚠️ No profile found
                </p>
              </div>
            )}
          </div>

          {/* Admin Status */}
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              3. Admin Status
            </h2>
            {profile ? (
              profile.role === "admin" ? (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
                  <p className="text-green-800 dark:text-green-200">
                    ✅ You ARE an admin!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                    Sign out and sign back in to see the Admin link in navigation.
                  </p>
                  <Link
                    href="/admin"
                    className="inline-block mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Go to Admin Dashboard →
                  </Link>
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded">
                  <p className="text-yellow-800 dark:text-yellow-200">
                    ⚠️ You are NOT an admin (role: {profile.role})
                  </p>
                  <div className="mt-3 text-sm text-yellow-700 dark:text-yellow-300">
                    <p className="font-semibold">To make yourself admin:</p>
                    <ol className="list-decimal ml-5 mt-2 space-y-1">
                      <li>Go to Supabase → SQL Editor</li>
                      <li>Run this query (replace with your email):</li>
                    </ol>
                    <pre className="bg-gray-800 text-green-400 p-3 rounded mt-2 overflow-x-auto">
{`UPDATE profiles
SET role = 'admin'
WHERE email = '${user?.email}';`}
                    </pre>
                    <li className="mt-2">Refresh this page after running the query</li>
                  </div>
                </div>
              )
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Cannot check admin status (no profile found)
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Quick Actions
            </h2>
            <div className="flex gap-3">
              <Link
                href="/"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Home
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Refresh Check
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
