import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function calcArea(length?: number | null, width?: number | null) {
  if (!length || !width) return 0;
  return Math.round(length * width * 100) / 100;
}

export function calcVolume(
  length?: number | null,
  width?: number | null,
  height?: number | null
) {
  if (!length || !width || !height) return 0;
  return Math.round(length * width * height * 100) / 100;
}
