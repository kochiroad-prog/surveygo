"use client";

import { useState, useTransition } from "react";
import { Trash2, X } from "lucide-react";
import { deletePhoto } from "@/lib/actions/photos";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/lib/supabase/types";

const PHOTO_TYPE_LABEL: Record<string, string> = {
  standard: "Foto",
  "360_panorama": "360°",
  sketch: "Sketsa",
};

export function PhotoGallery({
  projectId,
  photos,
  zones,
}: {
  projectId: string;
  photos: Tables<"survey_photos">[];
  zones: Tables<"survey_zones">[];
}) {
  const [lightbox, setLightbox] = useState<Tables<"survey_photos"> | null>(null);
  const [, startTransition] = useTransition();

  if (photos.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Belum ada foto. Upload lewat tab Survey Execution di tiap ruangan.
      </div>
    );
  }

  const zoneName = (id: string) => zones.find((z) => z.id === id)?.zone_name ?? "Ruangan";

  function handleDelete(photo: Tables<"survey_photos">) {
    if (!confirm("Hapus foto ini?")) return;
    startTransition(() => {
      deletePhoto(projectId, photo.id, photo.photo_url).catch(() => {
        alert("Gagal hapus foto");
      });
    });
    setLightbox(null);
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setLightbox(photo)}
            className="group relative overflow-hidden rounded-xl border border-border bg-card text-left"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.photo_url}
              alt={photo.caption ?? "Foto survey"}
              className="h-32 w-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute left-1.5 top-1.5">
              <Badge variant="accent">{PHOTO_TYPE_LABEL[photo.photo_type]}</Badge>
            </div>
            <div className="p-2">
              <div className="truncate text-[11px] font-medium">{zoneName(photo.zone_id)}</div>
              {photo.caption && (
                <div className="truncate text-[10px] text-muted-foreground">{photo.caption}</div>
              )}
            </div>
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="accent">{PHOTO_TYPE_LABEL[lightbox.photo_type]}</Badge>
                <span className="text-xs text-white">{zoneName(lightbox.zone_id)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(lightbox)}
                  className="rounded-full bg-white/10 p-1.5 text-white hover:bg-danger/80"
                  aria-label="Hapus foto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  className="rounded-full bg-white/10 p-1.5 text-white"
                  aria-label="Tutup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.photo_url}
              alt={lightbox.caption ?? "Foto survey"}
              className="max-h-[75vh] w-full rounded-xl object-contain"
            />
            {lightbox.caption && (
              <p className="mt-2 text-center text-xs text-slate-300">{lightbox.caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
