"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2, X } from "lucide-react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { recordPhoto } from "@/lib/actions/photos";
import { offlineDB } from "@/lib/offline/db";
import { Button } from "@/components/ui/button";

const PHOTO_TYPES = [
  { value: "standard", label: "Foto biasa" },
  { value: "360_panorama", label: "360°" },
  { value: "sketch", label: "Sketsa" },
];

export function PhotoUpload({
  projectId,
  zoneId,
  surveyItemId,
}: {
  projectId: string;
  zoneId: string;
  surveyItemId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState("standard");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
    setInfo(null);
  }

  function resetForm() {
    setOpen(false);
    setFile(null);
    setPreview(null);
    setCaption("");
  }

  function isNetworkErr(err: unknown) {
    if (err instanceof TypeError) return true;
    const msg = err instanceof Error ? err.message : String(err);
    return /fetch|network|offline/i.test(msg);
  }

  async function queueOffline(blob: Blob) {
    if (!offlineDB || !file) {
      setUploading(false);
      setError("Penyimpanan lokal tidak tersedia di perangkat ini.");
      return;
    }
    await offlineDB.photoQueue.add({
      id: crypto.randomUUID(),
      projectId,
      zoneId,
      surveyItemId: surveyItemId ?? null,
      blob,
      fileName: file.name,
      contentType: file.type,
      photoType,
      caption,
      createdAt: Date.now(),
      status: "pending",
    });
    setUploading(false);
    setInfo("Foto tersimpan offline — akan otomatis terupload saat kembali online.");
    resetForm();
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);
    setInfo(null);

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1.2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      if (!navigator.onLine) {
        await queueOffline(compressed);
        return;
      }

      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${projectId}/${zoneId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("survey-photos")
        .upload(path, compressed, { contentType: file.type });

      if (uploadError) {
        if (isNetworkErr(uploadError)) {
          await queueOffline(compressed);
          return;
        }
        setError(uploadError.message);
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from("survey-photos").getPublicUrl(path);

      const fd = new FormData();
      fd.set("zone_id", zoneId);
      if (surveyItemId) fd.set("survey_item_id", surveyItemId);
      fd.set("photo_url", publicUrlData.publicUrl);
      fd.set("photo_type", photoType);
      fd.set("caption", caption);

      startTransition(async () => {
        const result = await recordPhoto(projectId, null, fd);
        setUploading(false);
        if (result?.error) {
          setError(result.error);
          return;
        }
        resetForm();
      });
    } catch (err) {
      if (isNetworkErr(err)) {
        try {
          const compressed = await imageCompression(file, {
            maxSizeMB: 1.2,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });
          await queueOffline(compressed);
          return;
        } catch {
          // fall through to generic error below
        }
      }
      setUploading(false);
      setError(err instanceof Error ? err.message : "Gagal upload foto");
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Camera className="h-4 w-4" /> Tambah foto
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-background p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Upload foto</span>
        <button type="button" onClick={() => setOpen(false)} aria-label="Tutup">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Preview" className="h-40 w-full rounded-lg object-cover" />
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-32 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-xs text-muted-foreground"
        >
          <Camera className="h-5 w-5" />
          Ambil / pilih foto
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      {preview && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-[11px] text-accent"
        >
          Ganti foto
        </button>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <label className="text-[11px] text-muted-foreground">Tipe foto</label>
          <select
            value={photoType}
            onChange={(e) => setPhotoType(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-border bg-card px-2.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {PHOTO_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] text-muted-foreground">Caption</label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-border bg-card px-2.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            placeholder="Opsional"
          />
        </div>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
      {info && <p className="text-xs text-accent">{info}</p>}

      <Button
        type="button"
        variant="accent"
        size="sm"
        className="w-full"
        disabled={!file || uploading || isPending}
        onClick={handleUpload}
      >
        {uploading || isPending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Mengunggah...
          </>
        ) : (
          "Simpan foto"
        )}
      </Button>
    </div>
  );
}
