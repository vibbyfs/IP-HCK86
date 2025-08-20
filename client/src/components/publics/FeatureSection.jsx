import {
  IconBell,
  IconClock,
  IconRobot,
  IconShieldCheck,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import { FeatureSectionEffect } from "./ui_publics/FeaturesSectionEffect";

export default function FeatureSection() {
  return (
    <div id="features" className="h-[60vh] md:h-screen flex flex-col justify-center items-center px-4 scroll-mt-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl sm:pt-25 md:text-4xl">
          Fitur yang Bikin Tenang
        </h2>
        <p className="mt-3 text-sm text-neutral-700 sm:text-base">
          Dirancang untuk mengingatkan tanpa menggurui—pintar, sopan, dan pas
          timing-nya.
        </p>
      </div>
      <FeatureSectionEffect
        items={featuresDetail}
        direction="right"
        speed="slow"
      />
    </div>
  );
}

const featuresDetail = [
  {
    quote: <IconRobot className="h-10 w-10" aria-hidden />,
    name: "AI Parsing Cerdas",
    title:
      "Ketik natural:'ingatkan aku besok 08:00 ambil paket'. AI paham tanggal relatif dan konteks.",
  },
  {
    quote: <IconBell className="h-10 w-10" aria-hidden />,
    name: "Reminder ke Diri & Teman",
    title:
      "Tag teman atau kirim langsung ke kontak—nada tetap sopan dan personal.",
  },
  {
    quote: <IconUsers className="h-10 w-10" aria-hidden />,
    name: "Manajemen Teman Lengkap",
    title:
      "Kelola teman, izin, grup kecil, dan preferensi jam lintas zona waktu.",
  },
  {
    quote: <IconShieldCheck className="h-10 w-10" aria-hidden />,
    name: "Privasi Terjaga",
    title:
      "Enkripsi in transit, kontrol data, dan opsi auto delete untuk percakapan sensitif.",
  },
  {
    name: "Nada Personal & Hangat",
    quote: <IconSparkles className="h-10 w-10" aria-hidden />,
    title: "Template pesan humanis yang bisa diatur sesuai kepribadian.",
  },
  {
    name: "Pintar Zona Waktu",
    quote: <IconClock className="h-10 w-10" aria-hidden />,
    title: "Janji lintas kota? Waktu otomatis disesuaikan agar tepat momen.",
  },
];
