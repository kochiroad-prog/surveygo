"use client";

import { createClient } from "@/lib/supabase/client";
import { offlineDB, type QueuedTable, type CachedSurveyItem } from "@/lib/offline/db";
import type { Tables } from "@/lib/supabase/types";

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  const msg = err instanceof Error ? err.message : String(err);
  return /fetch|network|offline/i.test(msg);
}

function isOnline() {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

/**
 * Insert a row that is meant to end up in `table`. Tries a direct write
 * first; if that fails because the device is offline (or the request
 * itself can't reach the network), the row is cached locally and queued
 * for background sync instead of surfacing an error to the user.
 *
 * `insertPayload` must match the real table's Insert shape exactly (no
 * extra columns). `cacheExtra` is merged in only for the local Dexie
 * cache, e.g. to index survey_items by project_id even though that
 * column doesn't exist on the real table.
 */
export async function insertRowOfflineFirst<T extends Record<string, unknown>>(
  table: QueuedTable,
  insertPayload: T & { id: string },
  projectId: string,
  cacheExtra?: Record<string, unknown>
): Promise<{ ok: true; queued: boolean } | { ok: false; error: string }> {
  // Always cache locally first so the UI + reloads have the row immediately.
  if (offlineDB) {
    const cacheRow = { ...insertPayload, ...cacheExtra };
    if (table === "survey_zones") {
      await offlineDB.zones.put(cacheRow as unknown as Tables<"survey_zones">);
    } else {
      await offlineDB.items.put(cacheRow as unknown as CachedSurveyItem);
    }
  }

  if (isOnline()) {
    try {
      const supabase = createClient();
      const { error } = await supabase.from(table).insert(insertPayload as never);
      if (error) throw error;
      return { ok: true, queued: false };
    } catch (err) {
      if (!isNetworkError(err)) {
        return { ok: false, error: err instanceof Error ? err.message : "Gagal menyimpan" };
      }
      // fall through to queue
    }
  }

  if (offlineDB) {
    await offlineDB.mutationQueue.add({
      table,
      rowId: insertPayload.id,
      payload: insertPayload,
      projectId,
      createdAt: Date.now(),
      status: "pending",
    });
  }
  return { ok: true, queued: true };
}

export async function flushMutationQueue() {
  if (!offlineDB || !isOnline()) return;
  const supabase = createClient();
  const pending = await offlineDB.mutationQueue.where("status").equals("pending").sortBy("createdAt");

  for (const m of pending) {
    try {
      const { error } = await supabase.from(m.table).insert(m.payload as never);
      if (error) throw error;
      if (m.id != null) await offlineDB.mutationQueue.delete(m.id);
    } catch (err) {
      if (isNetworkError(err)) break; // stop, we're likely offline again
      if (m.id != null) {
        await offlineDB.mutationQueue.update(m.id, {
          status: "error",
          error: err instanceof Error ? err.message : "Gagal sync",
        });
      }
    }
  }
}

export async function flushPhotoQueue() {
  if (!offlineDB || !isOnline()) return;
  const supabase = createClient();
  const pending = await offlineDB.photoQueue.where("status").equals("pending").sortBy("createdAt");

  for (const p of pending) {
    try {
      const path = `${p.projectId}/${p.zoneId}/${p.id}.${p.fileName.split(".").pop() || "jpg"}`;
      const { error: uploadError } = await supabase.storage
        .from("survey-photos")
        .upload(path, p.blob, { contentType: p.contentType });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("survey-photos").getPublicUrl(path);

      const { error: insertError } = await supabase.from("survey_photos").insert({
        id: p.id,
        zone_id: p.zoneId,
        survey_item_id: p.surveyItemId ?? null,
        photo_url: publicUrlData.publicUrl,
        photo_type: p.photoType as never,
        caption: p.caption || null,
      });
      if (insertError) throw insertError;

      await offlineDB.photoQueue.delete(p.id);
    } catch (err) {
      if (isNetworkError(err)) break;
      await offlineDB.photoQueue.update(p.id, {
        status: "error",
        error: err instanceof Error ? err.message : "Gagal upload foto",
      });
    }
  }
}

export async function flushAll() {
  await flushMutationQueue();
  await flushPhotoQueue();
}

let bound = false;
export function initOfflineSync() {
  if (typeof window === "undefined" || bound) return;
  bound = true;
  window.addEventListener("online", () => void flushAll());
  setInterval(() => {
    if (isOnline()) void flushAll();
  }, 20000);
  if (isOnline()) void flushAll();
}
