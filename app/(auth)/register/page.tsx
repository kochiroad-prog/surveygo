"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signUp, type SignUpState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<SignUpState, FormData>(
    signUp,
    null
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1310] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <Image src="/logo-mark.png" alt="SiteSurvey Pro" width={36} height={36} className="rounded-lg" />
          <span className="text-lg font-medium text-white">SiteSurvey Pro</span>
        </div>

        <form action={formAction} className="space-y-4 rounded-xl border border-white/10 bg-[#121C18] p-6">
          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="text-white">Nama lengkap</Label>
            <Input
              id="full_name"
              name="full_name"
              required
              placeholder="Nama kamu"
              className="bg-white/5 text-white border-white/10 placeholder:text-slate-500"
            />
          </div>
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
              minLength={6}
              placeholder="Minimal 6 karakter"
              className="bg-white/5 text-white border-white/10 placeholder:text-slate-500"
            />
          </div>

          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          {state?.message && <p className="text-sm text-success">{state.message}</p>}

          <Button type="submit" variant="accent" className="w-full" disabled={isPending}>
            {isPending ? "Mendaftar..." : "Daftar"}
          </Button>

          <p className="text-center text-xs text-slate-400">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Masuk
            </Link>
          </p>
          <p className="text-center text-[10px] text-slate-500">
            Akun baru mendapat role surveyor. Hubungi admin untuk di-assign ke project.
          </p>
        </form>
      </div>
    </div>
  );
}
