"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { offlineDB } from "@/lib/offline/db";
import { initOfflineSync } from "@/lib/offline/sync";

/**
 * Starts the background sync listeners once and returns how many
 * mutations/photos are currently waiting to be pushed to the server.
 */
export function usePendingSyncCount() {
  useEffect(() => {
    initOfflineSync();
  }, []);

  const pendingMutations = useLiveQuery(
    () => offlineDB?.mutationQueue.where("status").equals("pending").count() ?? 0,
    [],
    0
  );
  const pendingPhotos = useLiveQuery(
    () => offlineDB?.photoQueue.where("status").equals("pending").count() ?? 0,
    [],
    0
  );

  return (pendingMutations ?? 0) + (pendingPhotos ?? 0);
}
