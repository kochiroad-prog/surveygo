import { AppShell } from "@/components/layout/app-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell activeHref="/dashboard">{children}</AppShell>;
}
