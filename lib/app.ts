//lib/app.ts

import { CheckCircle, HomeIcon, LucideIcon, MailIcon } from "lucide-react";

export const APPS = [
    { key: "main", href: "/", label: "Home", Icon: HomeIcon, colorClass: "text-green-500" }
]
export type AppKey = (typeof APPS)[number]["key"];
export type AppItem = (typeof APPS)[number];

export type NavLink = { href: string; label: string; Icon: LucideIcon};

export const APP_NAV: Record<AppKey, NavLink[]> = {
    main: [
    { href: "/", label: "Inbox", Icon: MailIcon },
    { href: "/tasks", label: "Tâches", Icon: CheckCircle}
    ]
} as const; 