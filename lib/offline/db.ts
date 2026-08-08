import Dexie, { type Table } from "dexie";
import type { Tables } from "@/lib/supabase/types";

export type QueuedTable = "survey_zones" | "survey_items";

export interface QueuedMutation {
  id?: number;
  table: QueuedTable;
  rowId: string;
  payload: Record<string, unknown>;
  projectId: string;
  createdAt: number;
  status: "pending" | "error";
  error?: string;
}

export interface QueuedPhoto {
  id: string;
  projectId: string;
  zoneId: string;
  surveyItemId?: string | null;
  blob: Blob;
  fileName: string;
  contentType: string;
  photoType: string;
  caption: string;
  createdAt: number;
  status: "pending" | "error";
  error?: string;
}

// survey_items has no project_id column on the real table, but we stash
// one on the cached copy so it can be indexed/queried per project locally.
export type CachedSurveyItem = Tables<"survey_items"> & { project_id: string };

class OfflineDB extends Dexie {
  zones!: Table<Tables<"survey_zones">, string>;
  items!: Table<CachedSurveyItem, string>;
  mutationQueue!: Table<QueuedMutation, number>;
  photoQueue!: Table<QueuedPhoto, string>;

  constructor() {
    super("sitesurvey-offline");
    this.version(1).stores({
      zones: "id, project_id",
      items: "id, zone_id, project_id",
      mutationQueue: "++id, status, projectId, createdAt, table",
      photoQueue: "id, status, projectId, zoneId, createdAt",
    });
  }
}

// Dexie needs IndexedDB, which is only available in the browser.
export const offlineDB: OfflineDB | null =
  typeof window !== "undefined" ? new OfflineDB() : null;
