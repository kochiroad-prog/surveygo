import { AppShell } from "@/components/layout/app-shell";

export default function ReportsPage() {
  return (
    <AppShell activeHref="/reports">
      <div className="p-6">
        <h1 className="mb-4 text-lg font-medium">Laporan</h1>
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Export laporan PDF lintas project — menyusul di fase berikutnya.
          Untuk saat ini, export per project ada di tab &quot;Export &amp; Laporan&quot;
          pada masing-masing halaman detail project.
        </div>
      </div>
    </AppShell>
  );
}
