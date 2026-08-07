import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Folder, Wrench, FileText } from "lucide-react";
import { LogoutButton } from "@/components/layout/logout-button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Project", icon: Folder },
  { href: "/equipment", label: "Peralatan", icon: Wrench },
  { href: "/reports", label: "Laporan", icon: FileText },
];

export function Sidebar({
  fullName,
  role,
  activeHref,
}: {
  fullName: string;
  role: string;
  activeHref: string;
}) {
  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="hidden md:flex w-[190px] shrink-0 flex-col bg-[#121C18] p-3">
      <div className="flex items-center gap-2 px-2 py-2 mb-6">
        <Image
          src="/logo-mark.png"
          alt="SiteSurvey Pro"
          width={28}
          height={28}
          className="rounded-lg"
        />
        <span className="text-sm font-medium text-white">SiteSurvey</span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = activeHref.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-accent/15 text-accent"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1">
        <div className="flex items-center gap-2 rounded-lg bg-white/5 p-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-medium text-[#04342C]">
            {initials || "?"}
          </div>
          <div>
            <div className="text-xs font-medium text-white">{fullName}</div>
            <div className="text-[10px] text-accent capitalize">{role.replace("_", " ")}</div>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
