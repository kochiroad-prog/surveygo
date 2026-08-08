import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import {
  PROJECT_STATUS_LABEL,
  PROJECT_TYPE_LABEL,
  CONDITION_LABEL,
  SURVEY_CATEGORY_LABEL,
  EQUIPMENT_CATEGORY_LABEL,
} from "@/lib/constants/thresholds";
import type { Tables } from "@/lib/supabase/types";

const COLORS = {
  primary: "#0F382C",
  accent: "#10B981",
  text: "#090A0A",
  muted: "#64748B",
  border: "#E5E7EB",
  warningBg: "#FAEEDA",
  warningText: "#854F0B",
  dangerBg: "#FDF2F2",
  dangerText: "#7F1D1D",
  successBg: "#E1F5EE",
  successText: "#085041",
};

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9, fontFamily: "Helvetica", color: COLORS.text },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 28, height: 28, borderRadius: 6 },
  headerTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: 700 },
  headerSub: { color: "#A7D9C8", fontSize: 8, marginTop: 2 },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
    color: COLORS.primary,
  },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  infoItem: { width: "31%", marginBottom: 6 },
  infoLabel: { fontSize: 7, color: COLORS.muted, marginBottom: 1 },
  infoValue: { fontSize: 9, fontWeight: 700 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 8,
  },
  statValue: { fontSize: 14, fontWeight: 700, color: COLORS.primary },
  statLabel: { fontSize: 7, color: COLORS.muted, marginTop: 2 },
  table: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 4 },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.border },
  trLast: { flexDirection: "row" },
  th: {
    flex: 1,
    padding: 5,
    fontSize: 7.5,
    fontWeight: 700,
    backgroundColor: "#F8FAF9",
    color: COLORS.muted,
  },
  td: { flex: 1, padding: 5, fontSize: 8 },
  badge: {
    fontSize: 7,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  zoneBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  zoneTitle: { fontSize: 10, fontWeight: 700, marginBottom: 2 },
  zoneMeta: { fontSize: 7.5, color: COLORS.muted, marginBottom: 6 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 4,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    fontSize: 7,
    color: COLORS.muted,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
  },
});

function badgeStyle(bg: string, textColor: string) {
  return { ...styles.badge, backgroundColor: bg, color: textColor };
}

function conditionBadge(status: string) {
  if (status === "critical") return badgeStyle(COLORS.dangerBg, COLORS.dangerText);
  if (status === "warning") return badgeStyle(COLORS.warningBg, COLORS.warningText);
  return badgeStyle(COLORS.successBg, COLORS.successText);
}

export function SurveyReportPDF({
  project,
  zones,
  items,
  checklists,
  logoUrl,
}: {
  project: Tables<"projects">;
  zones: Tables<"survey_zones">[];
  items: Tables<"survey_items">[];
  checklists: Tables<"equipment_checklists">[];
  logoUrl: string;
}) {
  const totalArea = zones.reduce((sum, z) => sum + (z.length ?? 0) * (z.width ?? 0), 0);
  const warningCount = items.filter((i) => i.condition_status !== "good").length;
  const checkedEquipment = checklists.filter((c) => c.is_checked).length;
  const generatedAt = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src={logoUrl} style={styles.logo} />
            <View>
              <Text style={styles.headerTitle}>SiteSurvey Pro</Text>
              <Text style={styles.headerSub}>Laporan Hasil Survey Lapangan</Text>
            </View>
          </View>
          <Text style={styles.headerSub}>{generatedAt}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{project.title}</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Klien</Text>
              <Text style={styles.infoValue}>{project.client_name || "-"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Alamat</Text>
              <Text style={styles.infoValue}>{project.address || "-"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tipe project</Text>
              <Text style={styles.infoValue}>{PROJECT_TYPE_LABEL[project.project_type]}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>{PROJECT_STATUS_LABEL[project.status]}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tanggal survey</Text>
              <Text style={styles.infoValue}>
                {project.survey_date
                  ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(
                      new Date(project.survey_date)
                    )
                  : "-"}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>No. telepon</Text>
              <Text style={styles.infoValue}>{project.client_phone || "-"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{zones.length}</Text>
            <Text style={styles.statLabel}>Ruangan/zona</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.round(totalArea * 100) / 100} m²</Text>
            <Text style={styles.statLabel}>Total luas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{items.length}</Text>
            <Text style={styles.statLabel}>Item diperiksa</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, warningCount > 0 ? { color: COLORS.dangerText } : {}]}>
              {warningCount}
            </Text>
            <Text style={styles.statLabel}>Temuan warning/kritis</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {checkedEquipment}/{checklists.length}
            </Text>
            <Text style={styles.statLabel}>Peralatan siap</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Checklist peralatan</Text>
          <View style={styles.table}>
            <View style={styles.tr}>
              <Text style={styles.th}>Alat</Text>
              <Text style={styles.th}>Kategori</Text>
              <Text style={styles.th}>Wajib</Text>
              <Text style={styles.th}>Status</Text>
            </View>
            {checklists.map((c, idx) => (
              <View key={c.id} style={idx === checklists.length - 1 ? styles.trLast : styles.tr}>
                <Text style={styles.td}>{c.item_name}</Text>
                <Text style={styles.td}>{EQUIPMENT_CATEGORY_LABEL[c.category]}</Text>
                <Text style={styles.td}>{c.is_required ? "Ya" : "Tidak"}</Text>
                <Text style={styles.td}>{c.is_checked ? "Siap" : "Belum siap"}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail ruangan &amp; temuan</Text>
          {zones.map((zone) => {
            const zoneItems = items.filter((i) => i.zone_id === zone.id);
            const area = Math.round((zone.length ?? 0) * (zone.width ?? 0) * 100) / 100;
            const volume =
              Math.round((zone.length ?? 0) * (zone.width ?? 0) * (zone.height ?? 0) * 100) / 100;

            return (
              <View key={zone.id} style={styles.zoneBox} wrap={false}>
                <Text style={styles.zoneTitle}>
                  {zone.zone_name} {zone.floor_level ? `— ${zone.floor_level}` : ""}
                </Text>
                <Text style={styles.zoneMeta}>
                  {area} m² • {volume} m³
                </Text>
                {zoneItems.length === 0 && (
                  <Text style={{ fontSize: 8, color: COLORS.muted }}>Belum ada item survey.</Text>
                )}
                {zoneItems.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={{ flex: 2 }}>
                      <Text style={{ fontSize: 8.5, fontWeight: 700 }}>{item.item_name}</Text>
                      <Text style={{ fontSize: 7, color: COLORS.muted }}>
                        {SURVEY_CATEGORY_LABEL[item.category]}
                        {item.moisture_percentage != null && ` • Moisture ${item.moisture_percentage}%`}
                        {item.lux_level != null && ` • Lux ${item.lux_level}`}
                      </Text>
                      {item.notes && (
                        <Text style={{ fontSize: 7, color: COLORS.muted, marginTop: 1 }}>
                          {item.notes}
                        </Text>
                      )}
                    </View>
                    <Text style={conditionBadge(item.condition_status)}>
                      {CONDITION_LABEL[item.condition_status]}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
          {zones.length === 0 && (
            <Text style={{ fontSize: 8, color: COLORS.muted }}>Belum ada ruangan/zona tercatat.</Text>
          )}
        </View>

        <Text style={styles.footer}>
          Dihasilkan otomatis oleh SiteSurvey Pro pada {generatedAt}. Laporan ini merangkum kondisi
          lapangan pada saat survey dilakukan.
        </Text>
      </Page>
    </Document>
  );
}
