import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { UserProfileRow } from "./users/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTimestamp(value: string | null, now = new Date()) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffDays = getDayDiff(date, now);
  if (diffDays <= 0) return formatTime(value);
  if (diffDays === 1) return `Hier ${formatTime(value)}`;
  if (diffDays === 2) return `Avant-hier ${formatTime(value)}`;
  if (diffDays < 7) return `${diffDays}j`;

  const weeks = Math.floor(diffDays / 7);
  return weeks === 1 ? "1semaine" : `${weeks}sem`;
}

export function formatDaySeparator(value: string | null, now = new Date()) {
  if (!value) return "Date inconnue";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date inconnue";

  const diffDays = getDayDiff(date, now);
  const time = formatTime(value);

  if (diffDays === 0) return `Aujourd'hui ${time}`;
  if (diffDays === 1) return `Hier ${time}`;
  if (diffDays === 2) return `Avant-hier ${time}`;

  const dateLabel = date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${dateLabel} ${time}`;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getDayDiff(date: Date, now: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY);
}

export function getDisplayName(profile: Pick<UserProfileRow, "first_name" | "last_name" | "email">) {
  const name = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || profile.email || "Utilisateur";
}
