import { Sidebar } from "@/components/layout/sidebar";
import { MobileTopBar, MobileBottomNav } from "@/components/layout/mobile-nav";
import { createClient } from "@/lib/supabase/server";

export async function AppShell({
  children,
  activeHref,
}: {
  children: React.ReactNode;
  activeHref: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let fullName = "Pengguna";
  let role = "surveyor";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile) {
      fullName = profile.full_name || user.email || "Pengguna";
      role = profile.role;
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar fullName={fullName} role={role} activeHref={activeHref} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <div className="flex-1 pb-16 md:pb-0">{children}</div>
        <MobileBottomNav activeHref={activeHref} />
      </div>
    </div>
  );
}
