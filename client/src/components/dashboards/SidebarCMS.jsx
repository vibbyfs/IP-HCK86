import {
  IconBell,
  IconEdit,
  IconLogout,
  IconMenu2,
  IconSparkles,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

export default function SidebarCMS() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
  }, [open]);

  const items = [
    {
      label: "Dashboard",
      href: "/dashboards",
      icon: <IconSparkles className="h-4 w-4" />,
    },
    {
      label: "Reminder",
      href: "/dashboards/reminders",
      icon: <IconBell className="h-4 w-4" />,
    },
    {
      label: "Teman",
      href: "/dashboards/friends",
      icon: <IconUsers className="h-4 w-4" />,
    },
    {
      label: "Profil",
      href: "/dashboards/profiles",
      icon: <IconEdit className="h-4 w-4" />,
    },
  ];

  return (
    <>
      {/* Mobile top bar with menu button */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-green-100 bg-white px-4 py-3 shadow-sm lg:hidden">
        <button
          aria-label="Buka menu"
          className="inline-flex items-center justify-center rounded-lg border border-neutral-200 p-2 text-neutral-700"
          onClick={() => setOpen(true)}
        >
          <IconMenu2 className="h-5 w-5" />
        </button>
        <a href="/dashboard" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-content-center rounded-xl bg-green-700 text-white">
            <IconBell className="h-5 w-5" />
          </div>
          <span className="font-semibold text-neutral-900">Remindly</span>
        </a>
        {/* Mobile logout button */}
        <a
          href="/login"
          aria-label="Keluar"
          title="Keluar"
          className="inline-flex items-center justify-center rounded-lg border border-neutral-200 p-2 text-neutral-700"
        >
          <IconLogout className="h-5 w-5" />
        </a>
        {/* <span className="text-sm text-neutral-500">Pro</span> */}
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-green-100 bg-black pt-4 shadow-sm lg:flex">
        <div className="flex items-center gap-2 px-4 text-white">
          <div className="grid h-9 w-9 place-content-center rounded-xl bg-black text-white ring-1 ring-white/10">
            <IconBell className="h-5 w-5" />
          </div>
          <span className="font-semibold">Remindly</span>
        </div>
        <nav className="mt-4 grid gap-1 px-2">
          {items.map((it) => (
            <a
              key={it.label}
              href={it.href}
              className="group flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white hover:bg-green-700"
            >
              <span className="text-white">{it.icon}</span>
              <span className="text-white">{it.label}</span>
            </a>
          ))}
        </nav>
        <div className="mt-auto grid gap-2 px-2 pb-4">
          <a
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-green-700 hover:text-white hover:border-green-700"
          >
            <IconLogout className="h-4 w-4" /> Keluar
          </a>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`fixed left-0 top-0 z-50 h-full w-[86%] max-w-xs bg-black shadow-xl transition-transform ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-green-100 px-4 py-3">
            <div className="flex items-center gap-2 text-white">
              <div className="grid h-8 w-8 place-content-center rounded-lg bg-black text-white ring-1 ring-white/10">
                <IconBell className="h-4 w-4" />
              </div>
              <span className="font-semibold">Remindly</span>
            </div>
            <button
              aria-label="Tutup menu"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 p-2 text-white"
              onClick={() => setOpen(false)}
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>
          <nav className="grid gap-1 p-3">
            {items.map((it) => (
              <a
                key={it.label}
                href={it.href}
                className="rounded-lg px-3 py-2 text-base text-white hover:bg-green-700"
                onClick={() => setOpen(false)}
              >
                {it.label}
              </a>
            ))}
          </nav>
          {/* Mobile logout at bottom of drawer */}
          <div className="mt-auto p-3">
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-green-700 hover:text-white hover:border-green-700 w-full"
              onClick={() => setOpen(false)}
            >
              <IconLogout className="h-4 w-4" /> Keluar
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
