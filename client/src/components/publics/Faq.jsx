import { IconArrowRight } from "@tabler/icons-react";

export default function FAQ() {
  return (
    <section id="faq" className="py-14 sm:py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl md:text-4xl">
          Pertanyaan Umum
        </h2>
        <div className="mt-6 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white sm:mt-8">
          {[
            {
              q: "Apakah butuh instal aplikasi?",
              a: "Tidak. Cukup hubungkan nomor WhatsApp, lalu kirim pesan seperti biasa.",
            },
            {
              q: "Bagaimana cara mengingatkan teman?",
              a: "Ketik perintah natural dan tag teman, misal: 'ingatkan @emily Jumat 19:00 latihan presentasi'. Kami konfirmasi sebelum mengirim.",
            },
            {
              q: "Apakah dataku aman?",
              a: "Kami menerapkan enkripsi in transit serta kontrol privasi granular. Bisa aktifkan auto delete.",
            },
            {
              q: "Bisakah pakai bahasa campur?",
              a: "Bisa. AI paham bahasa Indonesia sehari-hari dan bahasa lainnya.",
            },
          ].map((f, i, arr) => (
            <details key={f.q} className="group p-4 open:bg-neutral-50 sm:p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left sm:gap-4">
                <span className="text-sm font-medium text-neutral-900 sm:text-base">
                  {f.q}
                </span>
                <IconArrowRight className="h-4 w-4 transition group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-sm text-neutral-700">{f.a}</p>
              {i < arr.length - 1 && (
                <div className="mt-4 h-px w-full bg-neutral-200 sm:mt-6" />
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
