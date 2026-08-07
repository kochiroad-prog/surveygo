"use client";

import { useActionState } from "react";
import { MapPinned } from "lucide-react";
import { signIn, type AuthState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    signIn,
    null
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1310] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <MapPinned className="h-5 w-5 text-[#04342C]" />
          </div>
          <span className="text-lg font-medium text-white">SiteSurvey Pro</span>
        </div>

        <form action={formAction} className="space-y-4 rounded-xl border border-white/10 bg-[#121C18] p-6">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="nama@perusahaan.com"
              className="bg-white/5 text-white border-white/10 placeholder:text-slate-500"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="bg-white/5 text-white border-white/10 placeholder:text-slate-500"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-danger">{state.error}</p>
          )}

          <Button type="submit" variant="accent" className="w-full" disabled={isPending}>
            {isPending ? "Masuk..." : "Masuk"}
          </Button>
        </form>
      </div>
    </div>
  );
}
