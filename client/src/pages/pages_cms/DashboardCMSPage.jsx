import {
  IconMessage,
  IconPlus,
  IconShieldCheck,
  IconUsers,
} from "@tabler/icons-react";

export default function DashboardCMSPage() {
  return (
    <>
      <div className="min-h-screen bg-white text-black">
        <div className="lg:pl-64">
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <section className="rounded-2xl border border-green-100 bg-gradient-to-br from-white to-green-50 p-5 shadow-sm sm:p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h1 className="text-xl font-bold text-black sm:text-2xl">
                    Halo, <span className="text-green-700">{name}</span> 👋
                  </h1>
                  <p className="text-sm text-neutral-700">
                    Ringkasan aktivitas dan pengingatmu hari ini.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="/reminders"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-800"
                  >
                    <IconPlus className="h-4 w-4" /> Tambah Reminder
                  </a>
                  <a
                    href="/friends"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
                  >
                    <IconUsers className="h-4 w-4" /> Lihat Teman
                  </a>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                <span className="inline-flex items-center gap-1">
                  <IconShieldCheck className="h-4 w-4 text-green-700" /> Privasi
                  terjaga
                </span>
                <span className="inline-flex items-center gap-1">
                  <IconMessage className="h-4 w-4 text-green-700" />{" "}
                  Berbasis WhatsApp
                </span>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
