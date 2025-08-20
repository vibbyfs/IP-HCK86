import { IconArrowRight, IconBell } from "@tabler/icons-react";
import { Link } from "react-router";

export default function Navbar() {
  return (
    <>
  <header className="sticky top-0 z-30 border-b border-green-100 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#home" className="flex items-center gap-2">
    <div className="grid h-9 w-9 place-content-center rounded-xl bg-green-700 text-white shadow-sm">
              <IconBell className="h-5 w-5" />
            </div>
            <span className="font-semibold tracking-tight">HeyRemindly</span>
          </a>
          <div className="hidden items-center gap-3 md:flex">
            {[{ label: "Back to Home", href: "#features" }].map((n) => (
              <Link
                to="/"
                key={n.label}
                href={n.href}
        className="text-sm text-neutral-800 transition hover:text-green-700"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/login"
      className="inline-flex items-center rounded-xl border border-green-700 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50"
            >
              Login
            </Link>
            <Link
              to="/register"
      className="inline-flex items-center rounded-xl gap-2 border border-green-700 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50"
            >
              Hubungkan WhatsApp <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}
