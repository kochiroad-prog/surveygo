import { AppShell } from "@/components/layout/app-shell";

export default function EquipmentPage() {
  return (
    <AppShell activeHref="/equipment">
      <div className="p-6">
        <h1 className="mb-4 text-lg font-medium">Peralatan</h1>
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Manajemen inventaris peralatan lintas project — menyusul di fase berikutnya.
          Untuk saat ini, checklist peralatan per project ada di tab &quot;Pre-Survey &amp; Peralatan&quot;
          pada masing-masing halaman detail project.
        </div>
      </div>
    </AppShell>
  );
}
