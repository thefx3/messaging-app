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

export function getDisplayName(profile: Pick<UserProfileRow, "first_name" | "last_name" | "email">) {
  const name = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || profile.email || "Utilisateur";
}