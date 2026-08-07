import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0B1310] px-4 text-center">
      <Image src="/logo-mark.png" alt="SiteSurvey Pro" width={48} height={48} className="rounded-xl" />
      <div>
        <h1 className="text-lg font-medium text-white">Halaman tidak ditemukan</h1>
        <p className="mt-1 text-sm text-slate-400">
          URL yang kamu tuju tidak ada atau kamu tidak punya akses ke sana.
        </p>
      </div>
      <Button asChild variant="accent">
        <Link href="/dashboard">Kembali ke dashboard</Link>
      </Button>
    </div>
  );
}
