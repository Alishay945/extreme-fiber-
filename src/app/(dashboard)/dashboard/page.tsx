"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { useWisp } from "@/context/WispContext";
import {
  Users,
  CreditCard,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Zap,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Eye,
  Map,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { customers, payments, complaints, dailyChores } = useWisp();
  const [searchQuery, setSearchQuery] = useState("");

  // KPI Calculations
  const totalSubscribers = customers.length;
  const activeSubscribers = customers.filter((c) => c.status === "Active").length;
  const dcSubscribers = customers.filter((c) => c.status === "DC").length;

  const totalCollections = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalDuesOutstanding = customers.reduce((sum, c) => sum + c.dueAmount, 0);

  const openComplaintsCount = complaints.filter((c) => c.status !== "Resolved").length;

  // Sector Counts
  const saeelaCount = customers.filter((c) => c.area === "Saeela").length;
  const arsalCount = customers.filter((c) => c.area === "Arsal Town").length;
  const nougranCount = customers.filter((c) => c.area === "Nougran").length;

  // Filtered subscribers for dashboard search table
  const filteredCustomers = customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.area.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }).slice(0, 15); // Top 15 preview

  return (
    <main className="flex-1 pb-16 bg-slate-50 min-h-screen text-slate-900">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="mx-auto max-w-7xl px-4 md:px-6 pt-4 md:pt-6 space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-sky-700 font-extrabold">
              <Zap className="h-4 w-4 text-sky-600" /> Extreme Fiber Network Operations
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Network Overview & Sector Analytics
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Live statistics for Saeela, Nougran & Arsal Town network sectors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/customers"
              className="rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/20 transition hover:bg-sky-700 flex items-center gap-2"
            >
              <Users className="h-4 w-4" /> View All {totalSubscribers} Subscribers
            </Link>
          </div>
        </div>

        {/* KPI METRICS GRID */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Subscribers */}
          <div className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-extrabold uppercase tracking-wider text-sky-900">Total Subscribers</span>
              <div className="rounded-xl bg-sky-100 p-2 text-sky-700 border border-sky-200">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-slate-900">{totalSubscribers}</div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 border border-emerald-300">
                {activeSubscribers} Active
              </span>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 font-bold text-rose-800 border border-rose-300">
                {dcSubscribers} DC
              </span>
            </div>
          </div>

          {/* Card 2: Total Revenue Collected */}
          <div className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">Total Revenue</span>
              <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 border border-emerald-300">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-emerald-700 font-mono">
              PKR {totalCollections.toLocaleString()}
            </div>
            <p className="mt-2 text-xs text-slate-500 font-semibold">{payments.length} payment receipts logged</p>
          </div>

          {/* Card 3: Dues Pending */}
          <div className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900">Unpaid Dues</span>
              <div className="rounded-xl bg-amber-100 p-2 text-amber-700 border border-amber-300">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-amber-700 font-mono">
              PKR {totalDuesOutstanding.toLocaleString()}
            </div>
            <p className="mt-2 text-xs text-amber-800 font-bold">Pending billing collections</p>
          </div>

          {/* Card 4: Open Complaints */}
          <div className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-900">Helpdesk Tickets</span>
              <div className="rounded-xl bg-rose-100 p-2 text-rose-700 border border-rose-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-rose-700">{openComplaintsCount}</div>
            <p className="mt-2 text-xs text-slate-500 font-semibold">Active technical support tickets</p>
          </div>
        </div>

        {/* SECTOR BREAKDOWN (SAEELA, ARSAL TOWN, NOUGRAN) */}
        <div className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Map className="h-4 w-4 text-sky-600" /> Sector Network Distribution
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4">
              <span className="text-xs font-extrabold uppercase text-sky-800">Saeela Sector</span>
              <div className="mt-1 text-2xl font-black text-slate-900">{saeelaCount} Users</div>
              <p className="text-[11px] text-slate-600 mt-0.5 font-semibold">Area 1 Main Loop</p>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4">
              <span className="text-xs font-extrabold uppercase text-sky-800">Nougran Sector</span>
              <div className="mt-1 text-2xl font-black text-slate-900">{nougranCount} Users</div>
              <p className="text-[11px] text-slate-600 mt-0.5 font-semibold">Area 2 Main Loop</p>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4">
              <span className="text-xs font-extrabold uppercase text-sky-800">Arsal Town</span>
              <div className="mt-1 text-2xl font-black text-slate-900">{arsalCount} Users</div>
              <p className="text-[11px] text-slate-600 mt-0.5 font-semibold">Area 3 Main Loop</p>
            </div>
          </div>
        </div>

        {/* SUBSCRIBER QUICK VIEW TABLE */}
        <div className="rounded-2xl border border-sky-200 bg-white shadow-md overflow-hidden">
          <div className="flex items-center justify-between border-b border-sky-100 p-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Subscribers Directory</h3>
              <p className="text-xs text-slate-500 font-medium">Live line status & payment dues status</p>
            </div>
            <Link href="/customers" className="text-xs font-extrabold text-sky-700 hover:underline">
              View All Subscribers →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-sky-200 bg-sky-50 text-sky-950 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">User ID & Name</th>
                  <th className="px-4 py-3.5">Sector Area</th>
                  <th className="px-4 py-3.5">Package</th>
                  <th className="px-4 py-3.5">Line Status</th>
                  <th className="px-4 py-3.5">Payment Dues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 text-slate-800">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-sky-50/60 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{cust.name}</div>
                      <div className="text-[11px] font-mono text-sky-700 font-extrabold">{cust.id}</div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-700">{cust.area}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">{cust.packageName}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                          cust.status === "Active"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-rose-100 text-rose-800 border-rose-300"
                        }`}
                      >
                        {cust.status === "DC" ? "DC (Disconnected)" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      {cust.dueAmount > 0 ? (
                        <span className="text-amber-700 font-extrabold">Unpaid (PKR {cust.dueAmount})</span>
                      ) : (
                        <span className="text-emerald-700 font-bold">Paid (PKR 0)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
