"use client";

import dynamic from "next/dynamic";
import type { Tables } from "@/lib/supabase/types";

// @react-pdf/renderer needs browser APIs (Blob/DOM), so it must be loaded
// client-side only. `ssr: false` is only allowed inside a Client Component,
// hence this thin wrapper around the actual PdfPreview.
const PdfPreviewInner = dynamic(
  () => import("@/components/report/pdf-preview").then((m) => m.PdfPreview),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Memuat preview PDF...
      </div>
    ),
  }
);

export function PdfPreviewLoader(props: {
  project: Tables<"projects">;
  zones: Tables<"survey_zones">[];
  items: Tables<"survey_items">[];
  checklists: Tables<"equipment_checklists">[];
}) {
  return <PdfPreviewInner {...props} />;
}
