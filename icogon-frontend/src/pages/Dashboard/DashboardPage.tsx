import { useEffect, useState } from "react";

import Navbar from "../../components/dashboard/Navbar";

import { getMyProfileApi } from "../../api/profileApi";

interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  provider?: string;
}

const DashboardPage = () => {
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response =
          await getMyProfileApi();

        console.log(
          "PROFILE:",
          response.data
        );

        setProfile(
          response.data.profile
        );

      } catch (error) {
        console.error(
          "PROFILE ERROR:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070B14] text-white">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B14] text-white">

      <Navbar />

      <main className="p-6 lg:p-10">

        <div className="mx-auto max-w-7xl">

          {/* Welcome */}
          <div className="mb-10">

            <h1 className="text-3xl font-bold sm:text-4xl">
              Welcome to ICOGON AI 🚀
            </h1>

            <p className="mt-2 text-slate-500">
              Build websites, apps and AI agents
              with AI.
            </p>

          </div>

          {/* Dashboard Cards */}
          <div className="grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
              <p className="text-sm text-slate-500">
                Projects
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                0
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
              <p className="text-sm text-slate-500">
                AI Generations
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                0
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
              <p className="text-sm text-slate-500">
                Account
              </p>

              <h2 className="mt-3 text-lg font-semibold text-green-400">
                Active
              </h2>
            </div>

          </div>

          {/* Profile */}
          {profile && (
            <div className="mt-8 rounded-2xl border border-slate-800 bg-[#111827] p-6">

              <h2 className="text-xl font-semibold">
                Account Overview
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                <div>
                  <p className="text-sm text-slate-500">
                    Name
                  </p>

                  <p className="mt-1 font-medium">
                    {profile.full_name ||
                      "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Email
                  </p>

                  <p className="mt-1 font-medium">
                    {profile.email ||
                      "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Phone
                  </p>

                  <p className="mt-1 font-medium">
                    {profile.phone ||
                      "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Provider
                  </p>

                  <p className="mt-1 font-medium capitalize">
                    {profile.provider ||
                      "Not available"}
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>

      </main>

    </div>
  );
};

export default DashboardPage;