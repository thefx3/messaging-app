"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import icon from "@/app/icon.png";
import { APP_NAV, APPS, type AppKey } from "@/lib/app";

type NavBarProps = {
  appKey?: AppKey;
};

export default function NavBar({ appKey = "main" }: NavBarProps) {
  const pathname = usePathname();
  const navLinkClass =
    "group inline-flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold tracking-wide text-slate-700 transition hover:bg-slate-900/5 hover:text-slate-900";

  const navLinkActiveClass =
    "bg-slate-900 text-white shadow-sm hover:bg-slate-900 hover:text-white";

  const links = APP_NAV[appKey] ?? [];
  const app = APPS.find((item) => item.key === appKey);
  const activeRingClass = app?.colorClass
    ? app.colorClass.replace(/^text-/, "ring-")
    : "ring-slate-900/20";

  return (
    <aside className="hidden h-screen w-full shrink-0 border-r border-white/80 bg-white/70 shadow-sm backdrop-blur lg:flex lg:w-64 lg:flex-col">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-3 px-6 pt-6 text-lg font-semibold uppercase tracking-[0.25em] text-slate-900"
      >
        <Image
          src={icon}
          alt="La CLEF Logo"
          width={56}
          height={56}
          className={`h-14 w-14 rounded-2xl border border-white/80 bg-white/80 p-2 shadow-sm ring-2 ring-offset-2 ring-offset-white ${activeRingClass}`}
          priority
        />
        <span>La CLEF</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-3 px-4 pb-6">
        {links.map((link) => {
          const isInbox = link.href === "/";
          const otherLinks = links
            .map((item) => item.href)
            .filter((href) => href !== "/");
          const isActive = isInbox
            ? pathname === "/" ||
              !otherLinks.some(
                (href) =>
                  pathname === href || pathname.startsWith(`${href}/`),
              )
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.Icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${navLinkClass} ${isActive ? navLinkActiveClass : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
