import { Sidebar } from "@/components/layout/sidebar";
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
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
