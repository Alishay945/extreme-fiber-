"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Wifi, ShieldCheck, ArrowRight, UserCheck, KeyRound, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [role, setRole] = useState("Admin Supervisor");

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 overflow-hidden">
      {/* Dynamic Background Blurs */}
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/20">
            <Wifi className="h-8 w-8" />
          </div>
          <div className="pt-2 text-xs font-bold uppercase tracking-[0.35em] text-cyan-400">
            EXTREME FIBER WISP
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Staff Management Portal</h1>
          <p className="text-xs text-slate-400">
            Subscribers directory, Active / DC status, monthly dues, daily chores, & complaints.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = "/dashboard";
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="mb-1.5 block font-semibold text-slate-300">Staff Role / ID</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs text-slate-100 outline-none focus:border-cyan-500"
            >
              <option value="Admin Supervisor">Admin Supervisor (Full Access)</option>
              <option value="Billing Receptionist">Billing & Receptionist</option>
              <option value="Field Technician">Field Technician (Complaints Desk)</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block font-semibold text-slate-300">Operator Email</label>
            <input
              type="email"
              defaultValue="staff@extremefiber.net"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs text-slate-100 outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-semibold text-slate-300">Staff Access Key</label>
            <input
              type="password"
              defaultValue="••••••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs text-slate-100 outline-none focus:border-cyan-500"
            />
          </div>

          <Link
            href="/dashboard"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-cyan-950 transition hover:from-cyan-500 hover:to-blue-500 text-sm"
          >
            Launch Operations Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </form>

        <div className="mt-6 border-t border-slate-800/80 pt-4 text-center text-[11px] text-slate-500">
          <span className="flex items-center justify-center gap-1 text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> WISP Management System v2.4 Active
          </span>
        </div>
      </div>
    </main>
  );
}
