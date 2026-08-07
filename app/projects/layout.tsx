import { AppShell } from "@/components/layout/app-shell";

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell activeHref="/projects">{children}</AppShell>;
}
