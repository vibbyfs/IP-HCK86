import { IconMail, IconPhone, IconDeviceFloppy } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import http from "../../lib/http";
import { showSuccess, showError } from "../../utils/toastNotifications";
import { Link } from "react-router";

export default function ProfileCMSPage() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await http.get("/users/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        setProfile(response.data);
      } catch (err) {
        console.log("ERROR FETCH PROFILE", err);
        showError(err, "Gagal memuat profil", "profile-fetch-error");
      }
    }

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800">
      <div className="lg:pl-64">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <section className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl">
                  Profil Kamu
                </h1>
                <p className="text-sm text-neutral-700">
                  Perbarui data diri dan atur preferensi sesuai gayamu.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
                <div className="grid h-7 w-7 place-content-center rounded-full bg-green-100 text-green-700"></div>
                <span>ID:</span>
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="mb-1 block text-xs font-medium text-neutral-700"
                >
                  Username
                </label>
                <input
                  id="name"
                  name="username"
                  value={profile.username}
                  onChange={(e) =>
                    setForm({ ...profile, [e.target.name]: e.target.value })
                  }
                  placeholder="Nama"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-green-600 focus:ring focus:ring-green-600/20"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-xs font-medium text-neutral-700"
                >
                  Email
                </label>
                <div className="relative">
                  <IconMail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={(e) =>
                      setForm({ ...profile, [e.target.name]: e.target.value })
                    }
                    placeholder="Email"
                    className="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-green-600 focus:ring focus:ring-green-600/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-1 block text-xs font-medium text-neutral-700"
                >
                  Nomor WA
                </label>
                <div className="relative">
                  <IconPhone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={(e) =>
                      setForm({ ...profile, [e.target.name]: e.target.value })
                    }
                    placeholder="Nomor WhatsApp"
                    className="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-green-600 focus:ring focus:ring-green-600/20"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="bio"
                  className="mb-1 block text-xs font-medium text-neutral-700"
                >
                  Bio (opsional)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  value={profile.bio}
                  onChange={(e) =>
                    setForm({ ...profile, [e.target.name]: e.target.value })
                  }
                  placeholder="Sedikit tentang kamu"
                  className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-green-600 focus:ring focus:ring-green-600/20"
                />
              </div>

              <div className="md:col-span-2 mt-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link to={`/dashboards/update-profile/${profile.id}`}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-3 py-2 text-sm font-semibold text-white enabled:hover:bg-green-800 disabled:opacity-60"
                    >
                      Update <IconDeviceFloppy className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
