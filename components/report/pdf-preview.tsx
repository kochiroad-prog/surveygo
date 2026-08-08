"use client";

import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import { SurveyReportPDF } from "@/components/report/survey-report-pdf";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/lib/supabase/types";

export function PdfPreview({
  project,
  zones,
  items,
  checklists,
}: {
  project: Tables<"projects">;
  zones: Tables<"survey_zones">[];
  items: Tables<"survey_items">[];
  checklists: Tables<"equipment_checklists">[];
}) {
  const logoUrl =
    typeof window !== "undefined" ? `${window.location.origin}/icon-256.png` : "/icon-256.png";

  const doc = (
    <SurveyReportPDF
      project={project}
      zones={zones}
      items={items}
      checklists={checklists}
      logoUrl={logoUrl}
    />
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Preview laporan PDF</span>
        <PDFDownloadLink
          document={doc}
          fileName={`survey-${project.title.toLowerCase().replace(/\s+/g, "-")}.pdf`}
        >
          {({ loading }) => (
            <Button variant="accent" size="sm" disabled={loading}>
              <Download className="h-4 w-4" /> {loading ? "Menyiapkan..." : "Unduh PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      </div>
      <div className="overflow-hidden rounded-xl border border-border" style={{ height: "75vh" }}>
        <PDFViewer width="100%" height="100%" showToolbar={false} style={{ border: "none" }}>
          {doc}
        </PDFViewer>
      </div>
    </div>
  );
}
