"use client";
import { TypewriterEffectSmooth } from "./ui_publics/CtaSectionEffect.";
export function CtaSection() {
  const words = [
    {
      text: "Siap",
    },
    {
      text: "punya",
    },
    {
      text: "pengingat",
    },
    {
      text: "yang",
    },
    {
      text: "Manusiawi.",
      className: "text-green-500 dark:text-green-500",
    },
  ];
  return (
    <div id="cta" className="flex flex-col items-center justify-center h-[20rem] scroll-mt-24 ">
      <p className="text-black text-xs sm:text-base sm:text-center sm:m-5  ">
        Hubungkan WhatsApp kamu, atur preferensi nada, dan biarkan HeyRemindly
        menjaga momen penting—tanpa drama.
      </p>
      <TypewriterEffectSmooth words={words} />
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
        <button className="w-40 h-10 rounded-xl bg-white text-black border border-black hover:bg-green-600 hover:border-none hover:text-white text-sm cursor-pointer">
          Hubungkan Whatsapp
        </button>
        <button className="w-40 h-10 rounded-xl bg-white text-black border border-black hover:bg-green-600 hover:border-none hover:text-white text-sm cursor-pointer">
          Login
        </button>
      </div>
    </div>
  );
}
