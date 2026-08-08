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

export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-[#121C18] px-4 py-3 md:hidden">
      <div className="flex items-center gap-2">
        <Image
          src="/logo-mark.png"
          alt="SiteSurvey Pro"
          width={24}
          height={24}
          className="rounded-md"
        />
        <span className="text-sm font-medium text-white">SiteSurvey</span>
      </div>
      <LogoutButton variant="compact" />
    </header>
  );
}

export function MobileBottomNav({ activeHref }: { activeHref: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex items-stretch border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
      {NAV_ITEMS.map((item) => {
        const isActive = activeHref.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
              isActive ? "text-accent" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
