import {
  IconMessage,
  IconPlus,
  IconSearch,
  IconShieldCheck,
  IconUsers,
  IconClock,
  IconCheck,
  IconX,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import http from "../../lib/http";
import { formatToWIBFull } from "../../utils/time";

export default function RemindersCMSPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("DESC");
  const [rows, setRows] = useState([]);

  async function fetchReminders() {
    try {
      const response = await http.get("/reminders/actives", {
        params: { search, filter, sort },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      setRows(response.data);
    } catch (err) {
      console.log("ERROR FETCHING REMINDERS", err);
    }
  }

  async function handleCancelReminder(id) {
    try {
      await http.put(
        `/reminders/cancel/${id}`,
        { status: "cancelled" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      await fetchReminders();
    } catch (err) {
      console.log("ERROR REMINDER CANCEL", err);
    }
  }

  async function handleDeleteReminder(id) {
    try {
      await http.delete(`/reminders/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.log("ERROR FETCHING REMINDERS DELETE", err);
    }
  }

  useEffect(() => {
    fetchReminders();
  }, []);

  const localFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => (r.title || "").toLowerCase().includes(q));
  }, [rows, search]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800">
      <div className="lg:pl-64">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-green-100 bg-gradient-to-br from-white to-green-50 p-5 shadow-sm sm:p-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h1 className="text-xl font-bold text-black sm:text-2xl">
                  Kelola Pengingat
                </h1>
                <p className="text-sm text-neutral-700">
                  Semua agenda & tugas yang sudah kamu simpan di sini.
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
                <IconShieldCheck className="h-4 w-4 text-green-700" /> Reminder
                Aktif
              </span>
            </div>
          </section>
          {/* Controls */}
          <section className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
              <label
                htmlFor="q"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                Cari judul
              </label>
              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="q"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="misal: presentasi"
                  className="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-green-600 focus:ring focus:ring-green-600/20"
                />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSearch("");
                    fetchReminders();
                  }}
                  className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-neutral-800">
                Filter status
              </p>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring focus:ring-green-600/20"
              >
                <option value="">Semua</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Sent</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={fetchReminders}
                className="mt-2 rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50 cursor-pointer"
              >
                Terapkan
              </button>
            </div>

            <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-neutral-800">Urutkan</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSort("ASC");
                    fetchReminders();
                  }}
                  className={`rounded-xl px-3 py-2 text-sm cursor-pointer ${
                    sort === "ASC"
                      ? "bg-green-700 text-white"
                      : "border border-neutral-300 text-neutral-800 hover:bg-neutral-50"
                  }`}
                >
                  Terbaru
                </button>
                <button
                  onClick={() => {
                    setSort("DESC");
                    fetchReminders();
                  }}
                  className={`rounded-xl px-3 py-2 text-sm cursor-pointer ${
                    sort === "DESC"
                      ? "bg-green-700 text-white"
                      : "border border-neutral-300 text-neutral-800 hover:bg-neutral-50"
                  }`}
                >
                  Terlama
                </button>
              </div>
            </div>
          </section>

          {/* Table */}
          <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-neutral-900">
                Reminder Aktif
              </h2>
              <button
                onClick={fetchReminders}
                className="self-start rounded-xl bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100 sm:self-auto cursor-pointer"
              >
                Refresh
              </button>
            </div>

            <div className="mt-3 overflow-x-auto rounded-xl border border-neutral-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-neutral-50 text-neutral-600">
                  <tr>
                    <th className="px-3 py-2 font-medium">Judul</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Jatuh Tempo</th>
                    <th className="px-3 py-2 font-medium">Repeat</th>
                    <th className="px-3 py-2 font-medium">Penerima</th>
                    <th className="px-3 py-2 font-medium">Dibuat</th>
                    <th className="px-3 py-2 font-medium text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {localFiltered.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-50">
                      <td className="px-3 py-2 text-neutral-800">{r.title}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            r.status === "sent"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : r.status === "cancelled"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : r.status === "scheduled"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-neutral-50 text-neutral-700 border border-neutral-200"
                          }`}
                        >
                          {r.status === "sent" ? (
                            <>
                              <IconCheck className="inline-block h-3 w-3 mr-1" />
                              {r.status}
                            </>
                          ) : r.status === "cancelled" ? (
                            <>
                              <IconX className="inline-block h-3 w-3 mr-1" />
                              {r.status}
                            </>
                          ) : r.status === "scheduled" ? (
                            <>
                              <IconClock className="inline-block h-3 w-3 mr-1" />
                              {r.status}
                            </>
                          ) : (
                            <>
                              <IconClock className="inline-block h-3 w-3 mr-1" />
                              {r.status || "scheduled"}
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-neutral-600">
                        {formatToWIBFull(r.dueAt)}
                      </td>
                      <td className="px-3 py-2 text-neutral-600">
                        {r.repeat || "none"}
                      </td>
                      <td className="px-3 py-2 text-neutral-600">
                        {r.RecipientId ?? r.recipientId ?? "-"}
                      </td>
                      <td className="px-3 py-2 text-neutral-600">
                        {formatToWIBFull(r.createdAt)}
                      </td>
                      <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCancelReminder(r.id)}
                              aria-label="Cancel reminder"
                              title="Cancel reminder"
                              className="rounded-lg border border-red-300 bg-red-50 p-2 text-red-700 hover:bg-red-100 disabled:opacity-60 cursor-pointer"
                            >
                              <IconX className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteReminder(r.id)}
                              aria-label="Delete reminder"
                              title="Delete reminder"
                              className="rounded-lg border border-neutral-300 p-2 text-neutral-800 hover:bg-neutral-50 cursor-pointer"
                            >
                              <IconTrash className="h-4 w-4" />
                            </button>
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
