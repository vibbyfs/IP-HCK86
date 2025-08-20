import { IconBell } from "@tabler/icons-react";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-neutral-200 bg-white sm:mt-16">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:gap-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-content-center rounded-lg bg-green-600 text-white">
            <IconBell className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold">HeyRemindly</span>
          <span className="text-sm text-neutral-500">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-neutral-600">
          <a href="#" className="hover:text-green-700">Kebijakan Privasi</a>
          <a href="#" className="hover:text-green-700">Syarat Layanan</a>
          <a href="#" className="hover:text-green-700">Kontak</a>
        </div>
      </div>
    </footer>
  );
}